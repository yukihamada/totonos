/**
 * Shared fetch utilities with retry and timeout support
 */

export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

/**
 * Fetch with exponential backoff retry
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { 
    maxRetries = 3, 
    retryDelayMs = 1000,
    timeoutMs = 25000,
    ...fetchOptions 
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Don't retry on client errors (4xx) except rate limiting (429)
        if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
          return response;
        }

        // Retry on server errors (5xx) or rate limiting (429)
        if (response.status >= 500 || response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : retryDelayMs * Math.pow(2, attempt);
          
          console.warn(`Request failed with ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await sleep(delay);
          continue;
        }

        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on abort (timeout)
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error(`Request timed out after ${timeoutMs}ms`);
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }

      // Retry on network errors
      if (attempt < maxRetries - 1) {
        const delay = retryDelayMs * Math.pow(2, attempt);
        console.warn(`Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}):`, error);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  "AI API failed": "AI処理に一時的な問題が発生しました。しばらくしてから再試行してください。",
  "LOVABLE_API_KEY not configured": "システム設定エラーです。管理者にお問い合わせください。",
  "RESEND_API_KEY not configured": "メール送信の設定エラーです。管理者にお問い合わせください。",
  "Request timed out": "処理がタイムアウトしました。しばらくしてから再試行してください。",
  "Max retries exceeded": "サービスに一時的な問題が発生しています。しばらくしてから再試行してください。",
  "Network error": "ネットワークエラーが発生しました。接続を確認してください。",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  for (const [key, userMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) {
      return userMessage;
    }
  }
  
  return "処理中にエラーが発生しました。しばらくしてから再試行してください。";
}
