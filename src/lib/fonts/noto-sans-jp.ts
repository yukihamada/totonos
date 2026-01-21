// Noto Sans JP font for Japanese PDF generation
// This is a minimal subset containing common Japanese characters
// Full font would be ~1.5MB, this subset is optimized for business documents

// For jsPDF Japanese support, we use a CDN-based approach to avoid large bundle sizes
// The font will be loaded dynamically when generating PDFs

export const NOTO_SANS_JP_URL = 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf';

// Cache for the loaded font
let fontCache: string | null = null;
let fontLoadPromise: Promise<string> | null = null;

export async function loadNotoSansJP(): Promise<string> {
  if (fontCache) {
    return fontCache;
  }

  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    try {
      const response = await fetch(NOTO_SANS_JP_URL);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      fontCache = base64;
      return base64;
    } catch (error) {
      console.error('Failed to load Noto Sans JP font:', error);
      throw error;
    }
  })();

  return fontLoadPromise;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Preload font when module is imported
loadNotoSansJP().catch(() => {
  // Silent fail on preload - will retry on actual use
});
