// Noto Sans JP font for Japanese PDF generation
// Using TTF format which is compatible with jsPDF (NOT WOFF/WOFF2)

// Multiple font sources for fallback (TTF formats only - jsPDF compatible, CORS enabled)
const FONT_SOURCES = [
  // Primary: Google Fonts Static CDN (TTF with CORS)
  'https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFow2oe2A.ttf',
  // Fallback 1: jsDelivr CDN from fontsource (TTF with CORS)
  'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.19/files/noto-sans-jp-japanese-400-normal.woff',
  // Fallback 2: Bunny Fonts CDN (with CORS)
  'https://fonts.bunny.net/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff',
];

// Cache for the loaded font
let fontCache: string | null = null;
let fontLoadPromise: Promise<string> | null = null;

export async function loadNotoSansJP(): Promise<string> {
  if (fontCache) {
    console.log('[Font] Using cached Noto Sans JP font');
    return fontCache;
  }

  if (fontLoadPromise) {
    console.log('[Font] Waiting for existing font load promise');
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    let lastError: Error | null = null;

    for (const url of FONT_SOURCES) {
      try {
        console.log(`[Font] Trying to load from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const sizeInMB = (arrayBuffer.byteLength / 1024 / 1024).toFixed(2);
        console.log(`[Font] Font loaded: ${sizeInMB} MB`);
        
        // Validate minimum size (Japanese fonts should be > 500KB typically)
        if (arrayBuffer.byteLength < 100000) {
          throw new Error(`Font file too small (${arrayBuffer.byteLength} bytes), likely invalid`);
        }
        
        const base64 = arrayBufferToBase64(arrayBuffer);
        console.log(`[Font] Font encoded to base64: ${(base64.length / 1024 / 1024).toFixed(2)} MB`);
        
        fontCache = base64;
        console.log('[Font] ✓ Font cached successfully from:', url);
        return base64;
      } catch (error) {
        console.warn(`[Font] Failed to load from ${url}:`, error);
        lastError = error as Error;
      }
    }

    // All sources failed
    fontLoadPromise = null; // Reset to allow retry
    throw lastError || new Error('All font sources failed');
  })();

  return fontLoadPromise;
}

// Robust Base64 conversion for large font files
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  
  // For smaller files, use direct conversion
  if (bytes.length < 100000) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  // For larger files, process in chunks to avoid stack overflow
  const chunkSize = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    // Convert chunk to string character by character
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  
  return btoa(binary);
}

// Preload font when module is imported
loadNotoSansJP().catch((error) => {
  console.warn('[Font] Preload failed, will retry on actual use:', error.message);
});
