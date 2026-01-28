
# 監査ログとダミーデータの実データ化計画

## 現状の問題点

### 1. 監査ログ (`AuditLog.tsx`)
- `data_access_audit_log` テーブルは存在するが、データが空
- フォールバック処理で `invoices`, `contracts`, `leads`, `deals` からデータを取得している（疑似ログ）
- **問題**: 実際の操作履歴が記録されていない

### 2. EMR売上レポート (`EmrSalesReport.tsx`)
- `generateMockDailySales()` 関数で `Math.random()` を使ったダミーデータ生成
- **問題**: 実際のデータ (`emr_billing_details`, `emr_receipts`) が使われていない

### 3. AI売上予測 (`SalesForecast.tsx`)
- `monthlyForecast` と `dealForecasts` がハードコードされた配列
- **問題**: 実際の商談データ (`deals`) から集計されていない

### 4. レシートOCR (`ReceiptCapture.tsx`)
- `simulateOCR()` 関数がダミーデータを返している
- **問題**: 実際の `ocr-receipt` Edge Function が既に存在するが未使用

### 5. Web解析 (`WebAnalytics.tsx`)
- データ取得ロジックなし、プレースホルダーのみ
- **問題**: 解析データを表示する仕組みがない

---

## 修正計画

### Phase 1: 監査ログの実装（高優先度）

#### 1-A: データベーストリガーの追加
主要テーブルに INSERT/UPDATE/DELETE トリガーを追加し、自動的に `data_access_audit_log` にログを記録する。

対象テーブル:
- `invoices` (請求書)
- `contracts` (契約書)
- `leads` (リード)
- `deals` (商談)
- `clients` (取引先)
- `estimates` (見積書)
- `employees` (従業員)
- `journal_entries` (仕訳)

#### 1-B: ログ記録関数の作成

```sql
CREATE OR REPLACE FUNCTION public.log_table_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_audit_log (
    user_id,
    table_name,
    operation,
    record_id,
    query_details,
    created_at
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    TG_TABLE_NAME,
    TG_OP,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id 
      ELSE NEW.id 
    END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
    END,
    now()
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;
```

#### 1-C: useAuditLog フックの更新
- フォールバック処理を削除
- ユーザー情報（名前、メール）を `profiles` テーブルから取得
- フィルタリングをサーバーサイドで実行

### Phase 2: EMR売上レポートの実データ化

#### 2-A: `useEmrSalesReport` フックの作成

```typescript
// データベースから実売上データを取得
const { data: billingData } = await supabase
  .from('emr_billing_details')
  .select(`
    id,
    billing_date,
    total_points,
    insurance_type,
    patient_amount,
    insurance_amount,
    patient:patient_id (id, visit_type)
  `)
  .eq('company_id', currentCompany.id)
  .gte('billing_date', startDate)
  .lte('billing_date', endDate);
```

#### 2-B: 集計ロジックの実装
日付でグループ化し、保険種別ごとの集計を実行

### Phase 3: AI売上予測の実データ化

#### 3-A: 商談データからの予測生成

```typescript
// 実際の商談データを取得
const { data: deals } = await supabase
  .from('deals')
  .select('*')
  .in('stage', ['initial', 'proposal', 'negotiation', 'contract'])
  .order('expected_close_date', { ascending: true });

// 月別に集計して予測を生成
const monthlyData = groupByMonth(deals);
```

#### 3-B: AIインサイトの動的生成
既存のチャット機能を利用して、商談ごとのAI分析を取得

### Phase 4: レシートOCRの実連携

#### 4-A: `simulateOCR` を Edge Function 呼び出しに置換

```typescript
async function processOCR(imageBase64: string): Promise<OCRResult> {
  const { data, error } = await supabase.functions.invoke('ocr-receipt', {
    body: { 
      imageBase64,
      saveToDb: true,
      applyLegalTimestamp: true 
    }
  });
  
  if (error) throw error;
  return data.result;
}
```

### Phase 5: Web解析ページの実装（オプション）

現時点ではプレースホルダーのままとし、将来的に Google Analytics や独自の解析システムと連携する設計を残す。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| マイグレーション（新規） | `log_table_change()` 関数とトリガー作成 |
| `src/hooks/useAuditLog.ts` | フォールバック削除、ユーザー情報取得追加 |
| `src/hooks/useEmrSalesReport.ts` | 新規作成：実データ取得フック |
| `src/pages/emr/EmrSalesReport.tsx` | `generateMockDailySales` を削除、フック使用 |
| `src/hooks/useSalesForecast.ts` | 新規作成：商談データからの予測生成 |
| `src/pages/SalesForecast.tsx` | ハードコードされた配列を削除、フック使用 |
| `src/pages/ReceiptCapture.tsx` | `simulateOCR` を Edge Function 呼び出しに変更 |

---

## 技術的詳細

### トリガー作成SQL例

```sql
-- invoices テーブル用トリガー
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_table_change();

-- 同様に他のテーブルにも適用
```

### useAuditLog 修正ポイント

```typescript
// 修正後：ユーザー情報を profiles から取得
const { data: auditData } = await supabase
  .from('data_access_audit_log')
  .select(`
    *,
    profile:user_id (
      display_name,
      email
    )
  `)
  .order('created_at', { ascending: false })
  .limit(100);
```

---

## 期待される結果

1. **監査ログがリアルタイムで記録される**
   - 請求書、契約書、商談などの CRUD 操作がすべて記録される
   - ユーザー名、操作内容、タイムスタンプが正確に表示される

2. **EMR売上レポートが実データを表示**
   - 診療報酬、会計データがデータベースから取得される
   - ダミーデータが排除される

3. **AI売上予測が実商談データに基づく**
   - 実際の商談パイプラインから予測を生成
   - より正確なビジネスインサイトを提供

4. **レシートOCRが実際に動作**
   - 写真をアップロードすると AI による OCR 処理が実行される
   - 結果がデータベースに保存される
