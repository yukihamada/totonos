
# テスト結果と修正計画

## 発見された問題

### 1. CRMツールのenum不整合（要修正）

#### 1-A: `list_leads` のステータスenum不正
**ファイル**: `supabase/functions/chat/tools/crm.ts` (Line 12)

| 現在の定義 | 正しいデータベースenum |
|-----------|---------------------|
| `new, contacted, qualified, proposal, negotiation, won, lost` | `new, contacted, qualified, converted, lost` |

`proposal`, `negotiation`, `won` はdeal_stageのenumであり、lead_statusには存在しません。

#### 1-B: `get_pipeline_stats` のステージenum不正
**ファイル**: `supabase/functions/chat/tools/crm.ts` (Line 364)

| 現在の定義 | 正しいデータベースenum |
|-----------|---------------------|
| `discovery, proposal, negotiation, closed_won, closed_lost` | `initial, proposal, negotiation, contract, won, lost` |

パイプライン統計が正しく集計されません（常に0件になる）。

---

### 2. UI/UXの改善提案

#### 2-A: ランディングページの強化
- ヒーローセクションにアニメーションを追加
- CTA（Call To Action）ボタンのホバーエフェクト強化
- 顧客事例やロゴの追加検討

#### 2-B: 商談パイプライン（Deals.tsx / Pipeline.tsx）
- カンバンカードにホバー時のプレビュー情報追加
- ドラッグ中の視覚フィードバック強化
- 統計カードにトレンド矢印（前月比など）

#### 2-C: リード管理（Leads.tsx）
- 空状態のイラスト改善
- ステータスフィルタードロップダウン追加
- 一括操作ボタン（選択して一括ステータス変更）

#### 2-D: グローバル検索（GlobalSearch.tsx）
- 検索結果のハイライト表示
- 最近アクセスした項目の表示
- キーボードナビゲーションのヒント追加（既に実装済み）

#### 2-E: モバイルナビゲーション
- スワイプジェスチャー対応検討
- よく使う機能のカスタマイズ機能（既に設定で可能）

---

## 修正計画

### Phase 1: 重要なバグ修正

| ファイル | 修正内容 | 優先度 |
|---------|----------|--------|
| `supabase/functions/chat/tools/crm.ts:12` | `list_leads`のstatus enumを正しい値に修正 | 高 |
| `supabase/functions/chat/tools/crm.ts:364` | `get_pipeline_stats`のstage配列を正しい値に修正 | 高 |

### Phase 2: UI/UX改善（オプション）

| 改善項目 | 説明 | 工数 |
|---------|------|-----|
| パイプラインカードのホバー効果 | 金額・確度の詳細表示 | 低 |
| リードのバッチ操作 | 複数選択してステータス一括変更 | 中 |
| 空状態UIの改善 | より親しみやすいイラストと誘導文 | 低 |
| 検索結果ハイライト | マッチした文字列を強調表示 | 低 |

---

## 技術的詳細

### 修正1: list_leads ステータスenum

```typescript
// 修正前 (Line 12)
enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]

// 修正後
enum: ["new", "contacted", "qualified", "converted", "lost"]
```

### 修正2: get_pipeline_stats ステージenum

```typescript
// 修正前 (Line 364)
const stages = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"];

// 修正後
const stages = ["initial", "proposal", "negotiation", "contract", "won", "lost"];
```

---

## 変更ファイル一覧

| ファイル | 変更箇所 |
|---------|---------|
| `supabase/functions/chat/tools/crm.ts` | Line 12, Line 364 |

---

## 期待される結果

1. **AIアシスタント経由のリードフィルタリングが正常動作**
   - 正しいステータス値でフィルタリング可能に

2. **パイプライン統計が正確に表示**
   - 各ステージの商談数・金額が正しく集計される

3. **データベースエラーの解消**
   - enum不整合によるエラーが発生しなくなる
