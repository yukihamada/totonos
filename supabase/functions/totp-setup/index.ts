import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { encode as encodeBase32 } from "https://deno.land/std@0.168.0/encoding/base32.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 5 setup attempts per hour
const RATE_LIMIT = { maxRequests: 5, windowMs: 3600000 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting by user
    const rateLimitResult = await checkRateLimit(`totp-setup:${user.id}`, RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    switch (action) {
      case "init":
      case "totp-setup": {
        // Generate TOTP secret
        const secretBytes = new Uint8Array(20);
        crypto.getRandomValues(secretBytes);
        const secret = encodeBase32(secretBytes).replace(/=/g, "");

        // Generate otpauth URI for QR code
        const appName = Deno.env.get("APP_NAME") || "Totonos";
        const issuer = encodeURIComponent(appName);
        const account = encodeURIComponent(user.email || user.id);
        const otpauthUri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

        // Encrypt secret for storage (using simple XOR with env key - in production use proper encryption)
        const encryptionKey = Deno.env.get("TOTP_ENCRYPTION_KEY") || "default-dev-key-change-in-prod";
        const encryptedSecret = xorEncrypt(secret, encryptionKey);

        // Store pending setup in database
        const { error: dbError } = await supabaseClient.rpc("init_two_factor_setup", {
          p_user_id: user.id,
          p_totp_secret_encrypted: encryptedSecret,
        });

        if (dbError) {
          console.error("Database error:", dbError);
          return new Response(JSON.stringify({ error: "Failed to initialize 2FA setup" }), {
            status: 500,
            headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
          });
        }

        // Generate QR code data URI
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`;

        return new Response(JSON.stringify({
          qrCode: qrCodeUrl,
          secret: secret,
          otpauthUri: otpauthUri,
        }), {
          status: 200,
          headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
        });
      }

      case "verify": {
        // Verify TOTP code during setup
        const { code } = await req.json();

        if (!code || typeof code !== "string" || code.length !== 6) {
          return new Response(JSON.stringify({ error: "Invalid code format" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get stored secret
        const { data: tfaData } = await supabaseClient
          .from("user_two_factor")
          .select("totp_secret_encrypted, enabled")
          .eq("user_id", user.id)
          .single();

        if (!tfaData) {
          return new Response(JSON.stringify({ error: "2FA setup not initialized" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (tfaData.enabled) {
          return new Response(JSON.stringify({ error: "2FA already enabled" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Decrypt secret
        const encryptionKey = Deno.env.get("TOTP_ENCRYPTION_KEY") || "default-dev-key-change-in-prod";
        const secret = xorDecrypt(tfaData.totp_secret_encrypted, encryptionKey);

        // Verify TOTP code
        const isValid = verifyTOTP(secret, code);

        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid verification code" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate recovery codes
        const recoveryCodes = await generateRecoveryCodes();

        // Complete setup
        const { error: completeError } = await supabaseClient.rpc("complete_two_factor_setup", {
          p_user_id: user.id,
          p_recovery_codes: recoveryCodes.hashed,
        });

        if (completeError) {
          console.error("Failed to complete 2FA setup:", completeError);
          return new Response(JSON.stringify({ error: "Failed to complete 2FA setup" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({
          success: true,
          recoveryCodes: recoveryCodes.plain,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "status": {
        // Get 2FA status
        const { data: status } = await supabaseClient.rpc("get_two_factor_status", {
          p_user_id: user.id,
        });

        return new Response(JSON.stringify(status || { enabled: false }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "disable": {
        // Disable 2FA (requires current TOTP code)
        const { code } = await req.json();

        if (!code || typeof code !== "string" || code.length !== 6) {
          return new Response(JSON.stringify({ error: "Invalid code format" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get stored secret
        const { data: tfaData } = await supabaseClient
          .from("user_two_factor")
          .select("totp_secret_encrypted, enabled, locked_until")
          .eq("user_id", user.id)
          .single();

        if (!tfaData || !tfaData.enabled) {
          return new Response(JSON.stringify({ error: "2FA not enabled" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if locked
        if (tfaData.locked_until && new Date(tfaData.locked_until) > new Date()) {
          return new Response(JSON.stringify({
            error: "Account temporarily locked",
            locked_until: tfaData.locked_until,
          }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Decrypt and verify
        const encryptionKey = Deno.env.get("TOTP_ENCRYPTION_KEY") || "default-dev-key-change-in-prod";
        const secret = xorDecrypt(tfaData.totp_secret_encrypted, encryptionKey);
        const isValid = verifyTOTP(secret, code);

        if (!isValid) {
          // Record failed attempt
          await supabaseClient.rpc("record_two_factor_attempt", {
            p_user_id: user.id,
            p_success: false,
          });

          return new Response(JSON.stringify({ error: "Invalid verification code" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Disable 2FA
        await supabaseClient.rpc("disable_two_factor", {
          p_user_id: user.id,
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid endpoint" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("TOTP Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Simple XOR encryption (for development - use proper encryption in production)
function xorEncrypt(text: string, key: string): string {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(textBytes.length);

  for (let i = 0; i < textBytes.length; i++) {
    result[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return btoa(String.fromCharCode(...result));
}

function xorDecrypt(encrypted: string, key: string): string {
  const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i++) {
    result[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return new TextDecoder().decode(result);
}

// TOTP verification (RFC 6238)
function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 1000 / 30);

  // Check current and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const expectedCode = generateTOTP(secret, now + i);
    if (expectedCode === code) {
      return true;
    }
  }

  return false;
}

function generateTOTP(secret: string, counter: number): string {
  // Decode base32 secret
  const secretBytes = decodeBase32(secret);

  // Convert counter to bytes
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  // HMAC-SHA1
  const hmac = hmacSha1(secretBytes, counterBytes);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

function decodeBase32(encoded: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleanedInput = encoded.toUpperCase().replace(/=+$/, "");

  const bits: number[] = [];
  for (const char of cleanedInput) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    for (let i = 4; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    bytes.push(byte);
  }

  return new Uint8Array(bytes);
}

// Simple HMAC-SHA1 implementation
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;

  // Pad key to block size
  let paddedKey: Uint8Array;
  if (key.length > blockSize) {
    paddedKey = sha1(key);
  } else if (key.length < blockSize) {
    paddedKey = new Uint8Array(blockSize);
    paddedKey.set(key);
  } else {
    paddedKey = key;
  }

  // Create inner and outer padded keys
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  // Inner hash
  const innerData = new Uint8Array(ipad.length + message.length);
  innerData.set(ipad);
  innerData.set(message, ipad.length);
  const innerHash = sha1(innerData);

  // Outer hash
  const outerData = new Uint8Array(opad.length + innerHash.length);
  outerData.set(opad);
  outerData.set(innerHash, opad.length);

  return sha1(outerData);
}

// SHA-1 implementation
function sha1(data: Uint8Array): Uint8Array {
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const k = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

  // Pre-processing
  const ml = data.length * 8;
  const paddedLength = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;

  // Append length in bits
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, ml, false);

  // Process blocks
  for (let i = 0; i < paddedLength; i += 64) {
    const w = new Array(80);

    // Prepare message schedule
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let [a, b, c, d, e] = h;

    for (let j = 0; j < 80; j++) {
      let f: number, ki: number;
      if (j < 20) {
        f = (b & c) | (~b & d);
        ki = k[0];
      } else if (j < 40) {
        f = b ^ c ^ d;
        ki = k[1];
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        ki = k[2];
      } else {
        f = b ^ c ^ d;
        ki = k[3];
      }

      const temp = (rotl(a, 5) + f + e + ki + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30);
      b = a;
      a = temp;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  for (let i = 0; i < 5; i++) {
    resultView.setUint32(i * 4, h[i], false);
  }

  return result;
}

function rotl(n: number, s: number): number {
  return ((n << s) | (n >>> (32 - s))) >>> 0;
}

// Generate recovery codes
async function generateRecoveryCodes(): Promise<{ plain: string[]; hashed: any[] }> {
  const codes: string[] = [];
  const hashedCodes: any[] = [];

  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric code
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 8)
      .toUpperCase();

    codes.push(code);

    // Hash the code for storage
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(code)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    hashedCodes.push({
      hash: hashHex,
      used: false,
    });
  }

  return { plain: codes, hashed: hashedCodes };
}
