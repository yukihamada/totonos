import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, createRateLimitResponse, getRateLimitHeaders } from "../_shared/rate-limit.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 10 verification attempts per minute
const RATE_LIMIT = { maxRequests: 10, windowMs: 60000 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, code, useRecoveryCode } = await req.json();

    if (!userId || !code) {
      return new Response(JSON.stringify({ error: "Missing userId or code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting by user
    const rateLimitResult = await checkRateLimit(`totp-verify:${userId}`, RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's 2FA config
    const { data: tfaData } = await supabaseClient
      .from("user_two_factor")
      .select("totp_secret_encrypted, enabled, locked_until, recovery_codes")
      .eq("user_id", userId)
      .single();

    if (!tfaData || !tfaData.enabled) {
      return new Response(JSON.stringify({ error: "2FA not enabled for this user" }), {
        status: 400,
        headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
      });
    }

    // Check if account is locked
    if (tfaData.locked_until && new Date(tfaData.locked_until) > new Date()) {
      return new Response(JSON.stringify({
        error: "Account temporarily locked",
        locked_until: tfaData.locked_until,
      }), {
        status: 429,
        headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
      });
    }

    let isValid = false;

    if (useRecoveryCode) {
      // Verify recovery code
      const codeHash = await hashCode(code);
      const { data: result } = await supabaseClient.rpc("use_recovery_code", {
        p_user_id: userId,
        p_code_hash: codeHash,
      });

      if (result?.success) {
        isValid = true;
      } else {
        return new Response(JSON.stringify({
          error: result?.error || "Invalid recovery code",
          locked_until: result?.locked_until,
        }), {
          status: 400,
          headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
        });
      }
    } else {
      // Verify TOTP code
      if (code.length !== 6 || !/^\d+$/.test(code)) {
        return new Response(JSON.stringify({ error: "Invalid code format" }), {
          status: 400,
          headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
        });
      }

      // Decrypt secret
      const encryptionKey = Deno.env.get("TOTP_ENCRYPTION_KEY") || "default-dev-key-change-in-prod";
      const secret = xorDecrypt(tfaData.totp_secret_encrypted, encryptionKey);

      // Verify TOTP
      isValid = verifyTOTP(secret, code);

      // Record attempt
      await supabaseClient.rpc("record_two_factor_attempt", {
        p_user_id: userId,
        p_success: isValid,
      });
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), {
        status: 400,
        headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
      });
    }

    // Generate a short-lived verification token
    const verificationToken = await generateVerificationToken(userId);

    return new Response(JSON.stringify({
      success: true,
      verificationToken,
    }), {
      status: 200,
      headers: { ...corsHeaders, ...getRateLimitHeaders(rateLimitResult), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("TOTP Verify Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// XOR decryption
function xorDecrypt(encrypted: string, key: string): string {
  const encryptedBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const keyBytes = new TextEncoder().encode(key);
  const result = new Uint8Array(encryptedBytes.length);

  for (let i = 0; i < encryptedBytes.length; i++) {
    result[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return new TextDecoder().decode(result);
}

// TOTP verification
function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 1000 / 30);

  for (let i = -window; i <= window; i++) {
    const expectedCode = generateTOTP(secret, now + i);
    if (expectedCode === code) {
      return true;
    }
  }

  return false;
}

function generateTOTP(secret: string, counter: number): string {
  const secretBytes = decodeBase32(secret);
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  const hmac = hmacSha1(secretBytes, counterBytes);
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

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;

  let paddedKey: Uint8Array;
  if (key.length > blockSize) {
    paddedKey = sha1(key);
  } else if (key.length < blockSize) {
    paddedKey = new Uint8Array(blockSize);
    paddedKey.set(key);
  } else {
    paddedKey = key;
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }

  const innerData = new Uint8Array(ipad.length + message.length);
  innerData.set(ipad);
  innerData.set(message, ipad.length);
  const innerHash = sha1(innerData);

  const outerData = new Uint8Array(opad.length + innerHash.length);
  outerData.set(opad);
  outerData.set(innerHash, opad.length);

  return sha1(outerData);
}

function sha1(data: Uint8Array): Uint8Array {
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const k = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

  const ml = data.length * 8;
  const paddedLength = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, ml, false);

  for (let i = 0; i < paddedLength; i += 64) {
    const w = new Array(80);

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

async function hashCode(code: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(code.toUpperCase())
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function generateVerificationToken(userId: string): Promise<string> {
  const payload = {
    userId,
    exp: Date.now() + 300000, // 5 minutes
    nonce: crypto.randomUUID(),
  };

  const tokenData = JSON.stringify(payload);
  const signature = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(tokenData + (Deno.env.get("TOTP_ENCRYPTION_KEY") || ""))
  );

  return btoa(tokenData) + "." + btoa(String.fromCharCode(...new Uint8Array(signature)));
}
