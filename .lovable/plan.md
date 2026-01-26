
# PDF日本語文字化け・請求書編集・モック機能・招待フロー修正プラン

## 問題の詳細分析

### 1. PDF日本語文字化け問題

**根本原因特定：**

プレビューでは日本語が正常に表示されるのにPDFダウンロードで文字化けする理由は以下の通りです：

- **プレビュー（正常）**: `DocumentPreviewDialog.tsx` はHTMLベースで表示しており、ブラウザ標準のフォントレンダリングを使用するため問題なし
- **PDFダウンロード（文字化け）**: `jsPDF` はフォントを明示的に埋め込む必要があり、現在のNoto Sans JPフルバージョン（約1.5-2MB）がBase64変換時にデータ破損している可能性が高い

**技術的調査結果：**

`src/lib/fonts/noto-sans-jp.ts` で使用している変換方法を確認したところ、以下の問題が判明しました：

1. **フォントURL**: `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.2.9/files/noto-sans-jp-japanese-400-normal.ttf` はフルバージョンだが、このURLが正しくアクセス可能か不明
2. **チャンク処理**: 32KB単位で分割して `String.fromCharCode.apply` しているが、日本語フォントの完全なサポートには追加の検証が必要
3. **jsPDF互換性**: フォント登録後に `doc.setFont('NotoSansJP')` を呼んでいるが、Unicode文字のエンコーディングが正しく処理されていない可能性

**解決策：**

```typescript
// jsPDF でのフォント登録後に文字エンコーディングを確認
doc.addFileToVFS('NotoSansJP-Regular.ttf', fontCache);
doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
doc.setFont('NotoSansJP');
// フォントが正しくセットされたか確認するログ追加
console.log('[PDF] Current font:', doc.getFont());
```

また、フォントURLが404エラーを返している可能性があるため、代替の確実なCDNを使用します：

```typescript
// より信頼性の高いCDN URL
export const NOTO_SANS_JP_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP-Regular.ttf';
```

---

### 2. 請求書編集機能

**現状：**
- `src/pages/InvoiceEdit.tsx` は既に実装されており、`/invoices/:id/edit` ルートが存在
- `InvoiceDetail.tsx:120-125` に編集ボタンがあり、正しくリンクされている
- Supabaseへの更新処理も実装済み

**問題なし - この機能は既に動作しています**

ただし、編集ページへのリンク先が正しく動作しているか確認するためにブラウザで `/invoices/{id}/edit` にアクセスしてテストすることを推奨します。

---

### 3. 仮払い機能（モック→実データ）

**現状：**
`src/pages/AdvancePayment.tsx` は完全にモックデータ（`mockAdvancePayments`）を使用しており、データベースとの連携がありません。

**必要な変更：**

#### 3.1 データベーステーブル作成
```sql
CREATE TABLE public.advance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  purpose TEXT NOT NULL,
  requested_amount INTEGER NOT NULL,
  approved_amount INTEGER,
  settled_amount INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'settled', 'rejected', 'overdue')),
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE NOT NULL,
  settle_date DATE,
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE advance_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company advance payments"
ON advance_payments FOR SELECT TO authenticated
USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can create advance payments"
ON advance_payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
```

#### 3.2 新規フック作成
**ファイル**: `src/hooks/useAdvancePayments.ts`

```typescript
export function useAdvancePayments() {
  const { user } = useAuth();
  const { data: company } = useCurrentCompany();
  
  return useQuery({
    queryKey: ['advance-payments', company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advance_payments')
        .select('*')
        .eq('company_id', company?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id
  });
}

export function useCreateAdvancePayment() {
  // 仮払い申請の作成
}

export function useUpdateAdvancePaymentStatus() {
  // ステータス更新（承認/却下/精算）
}
```

#### 3.3 ページ更新
**ファイル**: `src/pages/AdvancePayment.tsx`

- `mockAdvancePayments` を削除
- `useAdvancePayments` フックに置き換え
- `handleSubmit` をSupabase insertに変更

---

### 4. その他のモック機能一覧

調査の結果、以下の機能がモックまたは準備中の状態です：

| 機能 | ファイル | 状態 | 対応 |
|------|----------|------|------|
| **銀行連携** | `BankConnections.tsx` | 準備中UI表示 | 外部API必要のため保留 |
| **自動消込** | `Reconciliation.tsx` | 準備中UI表示 | 銀行連携後に実装 |
| **工数記録** | `ProjectTimelog.tsx` | 準備中UI表示 | DBテーブル作成必要 |
| **承認ワークフロー** | `ApprovalWorkflow.tsx` | mockTemplates使用 | DBテーブル・フック作成必要 |
| **EMR売上レポート** | `emr/EmrSalesReport.tsx` | mockData使用 | EMR実データ連携必要 |
| **ダイナミックブースト** | `Boost.tsx` | 準備中（デフォルトOFF） | 外部ファクタリングAPI必要 |
| **トラストパスポート** | `TrustPassport.tsx` | 準備中（デフォルトOFF） | 信用スコアロジック必要 |

**今回の対応範囲：仮払い機能のみ実装**（他は外部APIや大規模な設計が必要なため）

---

### 5. メンバー招待の改善

**現状：**
- 招待時はメールアドレスとロールのみ指定
- 招待リンククリック後、「招待を受諾する」ボタンをクリックする必要がある

**ユーザー要望：**
1. 招待時に名前（オプション）を入力できるようにする
2. 招待リンククリック時に自動で所属が完了する

#### 5.1 データベーススキーマ変更
```sql
ALTER TABLE public.company_invitations
ADD COLUMN invitee_name TEXT;
```

#### 5.2 招待ダイアログの更新
**ファイル**: `src/pages/TeamMembers.tsx:255-278`

```typescript
<div className="space-y-4 py-4">
  <div className="space-y-2">
    <Label>名前（オプション）</Label>
    <Input
      placeholder="山田太郎"
      value={inviteName}
      onChange={(e) => setInviteName(e.target.value)}
    />
  </div>
  <div className="space-y-2">
    <Label>メールアドレス</Label>
    <Input
      type="email"
      placeholder="member@example.com"
      value={inviteEmail}
      onChange={(e) => setInviteEmail(e.target.value)}
    />
  </div>
  // ... 役割選択
</div>
```

#### 5.3 フック更新
**ファイル**: `src/hooks/useCompany.ts:369-435`

```typescript
mutationFn: async ({
  companyId,
  email,
  role,
  name,  // 追加
  permissions,
}: {
  companyId: string;
  email: string;
  role: MemberRole;
  name?: string;  // 追加
  permissions?: PermissionType[];
}) => {
  const { data, error } = await supabase
    .from("company_invitations")
    .insert({
      company_id: companyId,
      email,
      role,
      invitee_name: name || null,  // 追加
      permissions: permissions || [],
      invited_by: user.id,
    })
    .select()
    .single();
```

#### 5.4 招待受諾の自動化
**ファイル**: `src/pages/Invite.tsx:18-23`

```typescript
useEffect(() => {
  if (!authLoading && !user && token) {
    navigate(`/auth?redirect=/invite?token=${token}`);
    return;
  }
  
  // ログイン済みの場合は自動で受諾処理を実行
  if (!authLoading && user && token && status === 'idle') {
    handleAccept();
  }
}, [authLoading, user, token, status]);
```

#### 5.5 招待メールへの名前反映
**ファイル**: `supabase/functions/send-invitation/index.ts`

招待時に名前が入力されていた場合、メール本文に「○○様」として表示します。

---

## 実装ファイル一覧

### 新規作成
| ファイル | 内容 |
|----------|------|
| `supabase/migrations/XXXXXX_advance_payments.sql` | 仮払いテーブル・RLS |
| `supabase/migrations/XXXXXX_invitation_name.sql` | 招待テーブルにname追加 |
| `src/hooks/useAdvancePayments.ts` | 仮払いデータ取得・操作フック |

### 修正
| ファイル | 変更内容 |
|----------|----------|
| `src/lib/fonts/noto-sans-jp.ts` | フォントURL・読み込み処理の改善 |
| `src/lib/pdf-generator.ts` | フォント登録後の検証ログ追加 |
| `src/pages/AdvancePayment.tsx` | モック→実データ連携 |
| `src/pages/TeamMembers.tsx` | 名前入力フィールド追加 |
| `src/pages/Invite.tsx` | 自動受諾ロジック追加 |
| `src/hooks/useCompany.ts` | 招待作成時にname引数追加 |
| `supabase/functions/send-invitation/index.ts` | メールに名前反映 |

---

## 実装優先順位

1. **PDF日本語修正** - ユーザーへの影響大、即座に対応
2. **招待フロー改善** - 比較的シンプルな変更
3. **仮払い機能実装** - DB作成含む中規模変更

---

## テスト項目

### PDF
- 請求書PDFをダウンロードし、すべての日本語（漢字・ひらがな・カタカナ）が正しく表示されることを確認
- コンソールログで `[Font] Font loaded: X.XX MB` と表示されることを確認

### 招待
- 名前を入力して招待を送信し、メール本文に名前が反映されることを確認
- 招待リンクをクリックしてログイン後、自動的にダッシュボードへリダイレクトされることを確認
- 会社メンバー一覧に新メンバーが追加されていることを確認

### 仮払い
- 仮払い申請を作成し、データベースに保存されることを確認
- 一覧に反映されることを確認
- ステータス変更が機能することを確認
