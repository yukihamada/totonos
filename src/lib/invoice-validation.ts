/**
 * インボイス登録番号のバリデーション
 * 形式: T + 13桁の数字
 * 例: T1234567890123
 */

export function validateInvoiceRegistrationNumber(value: string): {
  isValid: boolean;
  error?: string;
} {
  if (!value) {
    return { isValid: true }; // 空は許可（任意項目）
  }

  const trimmed = value.trim().toUpperCase();

  // 形式チェック: T + 13桁の数字
  const pattern = /^T\d{13}$/;
  
  if (!pattern.test(trimmed)) {
    if (!trimmed.startsWith("T")) {
      return {
        isValid: false,
        error: "インボイス登録番号は「T」で始まる必要があります",
      };
    }
    if (trimmed.length !== 14) {
      return {
        isValid: false,
        error: "インボイス登録番号は「T」+ 13桁の数字（計14文字）です",
      };
    }
    return {
      isValid: false,
      error: "インボイス登録番号の形式が正しくありません",
    };
  }

  return { isValid: true };
}

/**
 * インボイス登録番号を正規化する
 * - 小文字のtを大文字Tに変換
 * - 前後の空白を除去
 */
export function normalizeInvoiceRegistrationNumber(value: string): string {
  if (!value) return "";
  return value.trim().toUpperCase();
}

/**
 * インボイス登録番号をフォーマット表示する
 * T1234567890123 -> T 1234-5678-9012-3 (読みやすく)
 */
export function formatInvoiceRegistrationNumber(value: string): string {
  if (!value) return "";
  
  const normalized = normalizeInvoiceRegistrationNumber(value);
  if (normalized.length !== 14) return value;
  
  const numbers = normalized.slice(1);
  // 4桁ずつに分割: 1234-5678-9012-3
  const formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  return `T ${formatted}`;
}
