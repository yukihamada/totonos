# Totonos 競合5社比較 - 未実装機能計画

## 調査対象
- **freee** (会計・経費・給与)
- **SmartHR** (人事労務・年末調整)
- **Salesforce Sales Cloud** (CRM・SFA)
- **Notion** (Wiki・プロジェクト管理)
- **クラウドサイン** (電子契約)

---

## 現在の実装状況サマリー

| カテゴリ | 実装済み機能数 | 主な機能 |
|---------|--------------|---------|
| 会計 | 15+ | 仕訳帳、元帳、BS/PL/CF、固定資産、経費精算、予算管理 |
| 請求書 | 10+ | 作成、PDF出力、自動消込、銀行連携、Dynamic Boost |
| CRM | 12+ | リード、商談、パイプライン、活動履歴、売上目標 |
| HR | 15+ | 従業員、勤怠、シフト、給与、年末調整、休暇管理 |
| 契約 | 6+ | 作成、電子署名、テンプレート、公開リンク |
| Wiki | 4+ | ページ作成、カテゴリ、検索 |
| 自動化 | 5+ | ワークフロー、メールテンプレート、通知 |

**総ページ数: 50ページ、総機能: 100+**

---

## 競合比較：未実装機能一覧

### 🔴 freee との差分

| 機能 | freee | Totonos | 優先度 |
|-----|-------|---------|--------|
| レシートOCR（スマホ撮影→自動仕訳） | ✅ | ❌ | 高 |
| 電子帳簿保存法対応（タイムスタンプ） | ✅ | ❌ | 高 |
| インボイス制度完全対応 | ✅ | △ | 高 |
| 銀行API実連携（住信SBI等） | ✅ | モック | 中 |
| クレジットカード連携 | ✅ | ❌ | 中 |
| 確定申告書作成 | ✅ | ❌ | 中 |
| 消費税申告書 | ✅ | ❌ | 中 |
| 部門別管理 | ✅ | ❌ | 低 |
| 税理士招待・共有 | ✅ | ❌ | 低 |

### 🔴 SmartHR との差分

| 機能 | SmartHR | Totonos | 優先度 |
|-----|---------|---------|--------|
| マイナンバー管理 | ✅ | ❌ | 高 |
| 社会保険・労働保険 電子申請 | ✅ | ❌ | 高 |
| 入社手続きオンライン化 | ✅ | △ | 高 |
| Web給与明細 | ✅ | ❌ | 高 |
| AI履歴書読み取り | ✅ | ❌ | 中 |
| 雇用契約の電子化 | ✅ | △ | 中 |
| 36協定管理 | ✅ | ❌ | 中 |
| 有給自動付与 | ✅ | △ | 低 |
| 組織図 | ✅ | ❌ | 低 |

### 🔴 Salesforce との差分

| 機能 | Salesforce | Totonos | 優先度 |
|-----|------------|---------|--------|
| AIリードスコアリング | ✅ | ❌ | 高 |
| AI売上予測 | ✅ | ❌ | 高 |
| メール自動同期（Gmail/Outlook） | ✅ | ❌ | 高 |
| カレンダー連携 | ✅ | ❌ | 高 |
| キャンペーン管理 | ✅ | ❌ | 中 |
| 見積承認ワークフロー | ✅ | △ | 中 |
| テリトリー管理 | ✅ | ❌ | 低 |
| 商談チーム（複数担当者） | ✅ | ❌ | 低 |
| Chatter（社内SNS） | ✅ | ❌ | 低 |
| モバイルアプリ | ✅ | PWA△ | 中 |

### 🔴 Notion との差分

| 機能 | Notion | Totonos | 優先度 |
|-----|--------|---------|--------|
| リッチテキストエディタ（Markdown完全対応） | ✅ | △ | 高 |
| ページ階層・ネスト | ✅ | ❌ | 高 |
| データベースビュー切替（テーブル/ボード/カレンダー/ガント） | ✅ | △ | 高 |
| Notion AI（文章生成・要約・翻訳） | ✅ | ❌ | 中 |
| リレーション・ロールアップ | ✅ | ❌ | 中 |
| コメント・メンション | ✅ | ❌ | 中 |
| ページ履歴・バージョン管理 | ✅ | ❌ | 中 |
| テンプレートボタン | ✅ | ❌ | 低 |
| ゲスト共有（外部コラボ） | ✅ | ❌ | 低 |
| API公開 | ✅ | ❌ | 低 |

### 🔴 クラウドサイン との差分

| 機能 | クラウドサイン | Totonos | 優先度 |
|-----|--------------|---------|--------|
| マイナンバーカード署名 | ✅ | ❌ | 中 |
| 当事者型署名 | ✅ | ❌ | 中 |
| 複数承認者ワークフロー | ✅ | △ | 高 |
| AI契約書読み取り | ✅ | ❌ | 中 |
| 契約期限アラート | ✅ | ❌ | 高 |
| IPアドレス制限 | ✅ | ❌ | 低 |
| SSO連携（SAML） | ✅ | ❌ | 中 |
| 監査ログ | ✅ | ❌ | 高 |
| 100+外部連携 | ✅ | △ | 低 |

---

## 優先度別 実装計画

### Phase 1: コア機能強化（高優先度）

#### 1.1 レシートOCR・経費自動化
```
src/pages/ExpenseCapture.tsx      # レシート撮影UI
src/hooks/useOCR.ts               # OCR処理フック
src/lib/receipt-ocr.ts            # Tesseract.js/Cloud Vision連携
supabase/functions/ocr-process/   # サーバーサイドOCR
```

#### 1.2 マイナンバー管理
```
src/pages/MyNumberManagement.tsx  # マイナンバー管理画面
src/hooks/useMyNumber.ts          # 暗号化・復号化
src/lib/encryption.ts             # AES暗号化
database: my_numbers テーブル     # 暗号化保存
```

#### 1.3 Web給与明細
```
src/pages/PayslipPortal.tsx       # 従業員向け給与明細
src/components/PayslipPDF.tsx     # 給与明細PDF
src/hooks/usePayslip.ts           # 明細データ取得
```

#### 1.4 AIリードスコアリング
```
src/components/LeadScoring.tsx    # スコア表示
src/hooks/useLeadScoring.ts       # スコアリングロジック
supabase/functions/ai-scoring/    # ML推論
```

#### 1.5 メール・カレンダー連携
```
src/pages/EmailSync.tsx           # Gmail/Outlook連携設定
src/pages/CalendarSync.tsx        # カレンダー連携
src/hooks/useEmailSync.ts         # OAuth認証
supabase/functions/email-sync/    # メール取込
```

#### 1.6 電子帳簿保存法対応
```
src/pages/EBookkeeping.tsx        # 電帳法対応画面
src/lib/timestamp.ts              # タイムスタンプ付与
src/hooks/useDocumentRetention.ts # 保存期間管理
```

#### 1.7 契約期限アラート
```
src/components/ContractAlerts.tsx # 期限アラート
src/hooks/useContractAlerts.ts    # アラート生成
supabase/functions/contract-reminder/ # 通知送信
```

#### 1.8 監査ログ
```
src/pages/AuditLog.tsx            # 監査ログ画面
src/hooks/useAuditLog.ts          # ログ記録
database: audit_logs テーブル     # 操作履歴
```

### Phase 2: 差別化機能（中優先度）

#### 2.1 Wiki強化（Notion風）
```
src/components/RichTextEditor.tsx # TipTapエディタ
src/pages/WikiHierarchy.tsx       # 階層表示
src/hooks/useWikiTree.ts          # ツリー構造管理
```

#### 2.2 AI機能追加
```
src/components/AIAssistant.tsx    # AI文章生成
src/components/SalesForecast.tsx  # 売上予測
src/hooks/useAIFeatures.ts        # AI機能統合
supabase/functions/ai-assistant/  # LLM連携
```

#### 2.3 データベースビュー
```
src/components/DatabaseViews/     # ビュー切替
  - TableView.tsx
  - BoardView.tsx
  - CalendarView.tsx
  - GanttView.tsx
src/hooks/useDatabaseViews.ts
```

#### 2.4 社会保険電子申請
```
src/pages/SocialInsurance.tsx     # 社会保険手続き
src/pages/LaborInsurance.tsx      # 労働保険手続き
src/lib/e-gov-api.ts              # e-Gov連携
```

#### 2.5 承認ワークフロー強化
```
src/pages/ApprovalWorkflow.tsx    # 承認フロー設定
src/components/ApprovalChain.tsx  # 複数承認者
src/hooks/useApproval.ts          # 承認処理
```

#### 2.6 SSO連携
```
src/pages/SSOSettings.tsx         # SSO設定
src/lib/saml.ts                   # SAML認証
src/lib/oauth-enterprise.ts       # エンタープライズOAuth
```

### Phase 3: 拡張機能（低優先度）

#### 3.1 モバイルPWA強化
```
public/manifest.json              # PWAマニフェスト
public/service-worker.js          # オフライン対応
src/components/MobileUI/          # モバイル最適化
```

#### 3.2 API公開
```
supabase/functions/public-api/    # REST API
docs/api-reference.md             # APIドキュメント
src/pages/APISettings.tsx         # APIキー管理
```

#### 3.3 外部連携
```
src/pages/Integrations.tsx        # 連携一覧
src/hooks/useIntegrations.ts      # 連携管理
supabase/functions/webhooks/      # Webhook処理
```

#### 3.4 組織図
```
src/pages/OrgChart.tsx            # 組織図表示
src/components/OrgTree.tsx        # ツリー描画
src/hooks/useOrgStructure.ts      # 組織構造
```

---

## 実装優先度マトリクス

```
                    影響度 高
                        │
    ┌───────────────────┼───────────────────┐
    │  メール連携        │  レシートOCR       │
    │  AIスコアリング    │  マイナンバー      │
    │  Web給与明細       │  電帳法対応        │
    │                    │  監査ログ          │
    ├────────────────────┼───────────────────┤
    │  Wiki強化          │  契約期限アラート  │
    │  承認ワークフロー  │  SSO連携          │
    │  データベースビュー│                    │
    │                    │                    │
    └───────────────────┴───────────────────┘
  実装容易              実装困難

```

---

## 推奨実装順序

1. **契約期限アラート** - 既存機能の拡張で実装容易
2. **監査ログ** - セキュリティ基盤として必須
3. **Web給与明細** - 従業員価値向上
4. **レシートOCR** - 差別化機能（Cloud Vision使用）
5. **AIリードスコアリング** - CRM差別化
6. **電子帳簿保存法対応** - 法令対応
7. **マイナンバー管理** - HR機能完成
8. **メール連携** - CRM強化
9. **Wiki強化（TipTap）** - UX向上
10. **SSO連携** - エンタープライズ対応

---

## 参考リンク

### freee
- [freee会計 機能一覧](https://carearc.co.jp/blog/3781/)
- [freee 料金プラン](https://www.freee.co.jp/accounting/new-corporation/pricing/)

### SmartHR
- [SmartHR 機能一覧](https://smarthr.jp/function/)
- [SmartHR 2026年最新版](https://digi-mado.jp/article/107657/)

### Salesforce
- [Sales Cloud 機能一覧](https://www.salesforce.com/jp/products/sales-cloud/features/)
- [Einstein AI](https://www.salesforce.com/jp/sales/ai/)

### Notion
- [Notion 139機能一覧](https://kaizennn.com/notion-all-features/)
- [Notion AI 2026](https://smart-factory-kenkyujo.com/notion-ai/)

### クラウドサイン
- [クラウドサイン 機能一覧](https://www.cloudsign.jp/features/)
- [外部連携](https://www.cloudsign.jp/integrations_category/flow/)

---

## 結論

**現在の充足率（推定）:**
- freee: 70%
- SmartHR: 60%
- Salesforce: 55%
- Notion: 40%
- クラウドサイン: 65%

**Phase 1完了後の目標充足率:**
- freee: 90%
- SmartHR: 85%
- Salesforce: 80%
- Notion: 60%
- クラウドサイン: 85%

**総合評価:** 現在のTotonosは基本機能は網羅しているが、AI機能・法令対応・エンタープライズ機能に差がある。Phase 1の8機能を実装することで、競合と同等以上のポジションを確立可能。
