// Noto Sans JP font for Japanese PDF generation
// Full version from fontsource for complete Japanese character support

export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.2.9/files/noto-sans-jp-japanese-400-normal.ttf';

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
    try {
      console.log('[Font] Loading Noto Sans JP from CDN...');
      const response = await fetch(NOTO_SANS_JP_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`[Font] Font loaded: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
      
      const base64 = arrayBufferToBase64(arrayBuffer);
      console.log(`[Font] Font encoded to base64: ${(base64.length / 1024 / 1024).toFixed(2)} MB`);
      
      fontCache = base64;
      console.log('[Font] Font cached successfully');
      return base64;
    } catch (error) {
      console.error('[Font] Failed to load Noto Sans JP font:', error);
      fontLoadPromise = null; // Reset to allow retry
      throw error;
    }
  })();

  return fontLoadPromise;
}

// Robust Base64 conversion for large font files
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // Process in 32KB chunks to avoid call stack issues
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Preload font when module is imported
loadNotoSansJP().catch(() => {
  // Silent fail on preload - will retry on actual use
});
