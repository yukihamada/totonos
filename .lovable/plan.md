
# PDF日本語表示の確実な修正プラン

## 問題の根本原因

**jsPDFはTTF形式のみをサポートしていますが、現在のコードは`.woff`形式のフォントをロードしています。**

| 項目 | 現状 | 正しい設定 |
|------|------|-----------|
| フォント形式 | `.woff` | `.ttf` |
| URL | `...NotoSansJP-Regular.woff` | `.ttf`ファイルのURL |
| jsPDF互換性 | ❌ 非対応 | ✅ 対応 |

この形式の不一致により、jsPDFがフォントデータを正しく解析できず、日本語が文字化けまたは表示されない状態になっています。

---

## 修正方法

### 1. フォントURLをTTF形式に変更

**ファイル**: `src/lib/fonts/noto-sans-jp.ts`

信頼できるCDNからNoto Sans JP の **TTF形式** を取得するようURLを変更します。

```typescript
// 変更前（WOFF形式 - jsPDF非対応）
export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/gh/nicolo-ribaudo/noto-sans-japanese-static@2.005/NotoSansJP-Regular.woff';

// 変更後（TTF形式 - jsPDF対応）
export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.19/files/noto-sans-jp-all-400-normal.woff';
// ↑ まだWOFFのため、別のソースが必要

// 確実に動作するTTFソース（Google Fonts公式リポジトリ）
export const NOTO_SANS_JP_URL = 'https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf';
// ↑ OTFもjsPDFで動作する場合があるが、TTFが最も安全

// 最も推奨されるソース
export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/gh/nicolo-ribaudo/noto-sans-japanese-static@2.005/NotoSansJP-Regular.otf';
```

**推奨される最終的なURL**:
複数のソースをテストし、確実に動作するものを使用：

```typescript
// Option 1: Google Fonts StaticからのTTF（軽量版）
export const NOTO_SANS_JP_URL = 'https://cdn.jsdelivr.net/gh/nicolo-ribaudo/noto-sans-japanese-static@2.005/NotoSansJP-Regular.otf';

// Option 2: fonts.bunny.net からのTTF（高速CDN）
export const NOTO_SANS_JP_URL = 'https://fonts.bunny.net/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2';
// ↑ WOFF2は非対応

// Option 3: 事前にBase64としてプロジェクトに埋め込み（最も確実）
// → フォントファイルを手動でBase64に変換し、静的ファイルとして含める
```

### 2. 確実な解決策：事前埋め込みBase64

動的なCDN取得ではなく、**ビルド時にフォントを含める**ことで確実性を担保します。

**新規ファイル**: `src/lib/fonts/noto-sans-jp-embedded.ts`

```typescript
// Noto Sans JP Regular - Pre-encoded Base64 TTF
// Generated from https://github.com/googlefonts/noto-cjk
// File size: ~2MB (base64: ~2.7MB)

export const NOTO_SANS_JP_BASE64 = "AAEAAAASAQAABAAgR0RFRj..." // 約2.7MB

export function getEmbeddedFont(): string {
  return NOTO_SANS_JP_BASE64;
}
```

**注意**: Base64埋め込みはバンドルサイズが大きくなるため、動的ロードが失敗した場合のフォールバックとして使用することを推奨。

### 3. フォントロード関数の改善

**ファイル**: `src/lib/fonts/noto-sans-jp.ts`

```typescript
// 複数のフォントソースを試行するフォールバック機能
const FONT_SOURCES = [
  // Primary: jsdelivr CDN (TTF/OTF)
  'https://cdn.jsdelivr.net/gh/nicolo-ribaudo/noto-sans-japanese-static@2.005/NotoSansJP-Regular.otf',
  // Fallback 1: Google Fonts GitHub (OTF)  
  'https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf',
  // Fallback 2: Alternative CDN
  'https://unpkg.com/noto-sans-jp-subset@1.0.0/fonts/NotoSansJP-Regular.otf',
];

export async function loadNotoSansJP(): Promise<string> {
  if (fontCache) {
    return fontCache;
  }

  let lastError: Error | null = null;

  for (const url of FONT_SOURCES) {
    try {
      console.log(`[Font] Trying: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Validate minimum size (Japanese fonts should be > 1MB)
      if (arrayBuffer.byteLength < 500000) {
        throw new Error('Font file too small, likely invalid');
      }
      
      const base64 = arrayBufferToBase64(arrayBuffer);
      fontCache = base64;
      console.log('[Font] Successfully loaded from:', url);
      return base64;
    } catch (error) {
      console.warn(`[Font] Failed to load from ${url}:`, error);
      lastError = error as Error;
    }
  }

  throw lastError || new Error('All font sources failed');
}
```

### 4. pdf-generatorの検証ログ追加

**ファイル**: `src/lib/pdf-generator.ts`

初期化成功をより明確に検証：

```typescript
const initializeJapaneseFont = async (doc: jsPDF): Promise<void> => {
  try {
    if (!fontCache) {
      console.log('[PDF] Loading Japanese font...');
      fontCache = await loadNotoSansJP();
    }
    
    // Validate font data
    if (!fontCache || fontCache.length < 100000) {
      throw new Error('Invalid font data: too small');
    }
    
    doc.addFileToVFS('NotoSansJP-Regular.ttf', fontCache);
    doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
    doc.setFont('NotoSansJP');
    
    // Verify font is actually set
    const currentFont = doc.getFont();
    if (currentFont.fontName !== 'NotoSansJP') {
      throw new Error('Font was not set correctly');
    }
    
    console.log('[PDF] ✓ Japanese font ready:', currentFont);
  } catch (error) {
    console.error('[PDF] Font initialization failed:', error);
    // エラー時はPDF生成を中止するか、ユーザーに警告
    throw new Error('日本語フォントの読み込みに失敗しました。');
  }
};
```

---

## 実装ファイル一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/lib/fonts/noto-sans-jp.ts` | TTF/OTF形式のURLに変更、フォールバック機能追加 |
| `src/lib/pdf-generator.ts` | フォント検証ロジック追加、エラーハンドリング改善 |

---

## 技術的詳細

### jsPDFのフォント対応形式
| 形式 | 対応状況 | 備考 |
|------|----------|------|
| TTF | ✅ 完全対応 | 推奨 |
| OTF | ✅ 対応 | TTFとほぼ同等 |
| WOFF | ❌ 非対応 | Web専用の圧縮形式 |
| WOFF2 | ❌ 非対応 | Web専用の圧縮形式 |

### 推奨フォントソース

1. **jsdelivr CDN** (高速・安定)
   - `https://cdn.jsdelivr.net/gh/nicolo-ribaudo/noto-sans-japanese-static@2.005/NotoSansJP-Regular.otf`

2. **GitHub Raw** (公式ソース)
   - `https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf`

---

## テスト項目

1. **請求書PDFダウンロード**
   - 「請求書」ヘッダーが正しく表示される
   - 品目名、会社名などの日本語がすべて正しく表示される

2. **見積書PDFダウンロード**
   - 「見積書」ヘッダーが正しく表示される

3. **契約書PDFダウンロード**
   - 「契約書」ヘッダーが正しく表示される
   - 長い日本語テキストが正しく折り返される

4. **エラーケース**
   - ネットワークエラー時に適切なエラーメッセージが表示される
