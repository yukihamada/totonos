

# 包括的テスト結果・修正・UI改善計画

## 発見された問題

### 1. AIツールのenum不整合（重要度：高）

#### 1-A: HRツールの `employee_status` 不整合
**ファイル**: `supabase/functions/chat/tools/hr.ts` (Line 16, 95)

| AIツール定義 | データベースenum |
|------------|-----------------|
| `active, inactive, on_leave` | `active, on_leave, resigned` |

`inactive` が存在せず、`resigned`（退職）が抜けています。

---

### 2. UI/UX改善提案

#### 2-A: リード管理ページ (Leads.tsx)
| 現状 | 改善案 |
|-----|-------|
| ステータスフィルターがない | ドロップダウンでステータスフィルター追加 |
| 一括操作ができない | チェックボックスで複数選択→一括ステータス変更 |
| リードから商談への動線が弱い | 「商談を作成」アクションをドロップダウンに追加 |

#### 2-B: 商談パイプライン (Deals.tsx / Pipeline.tsx)
| 現状 | 改善案 |
|-----|-------|
| ドラッグ中の視覚フィードバックが弱い | ドラッグ中カードにシャドウ＆スケール効果追加 |
| カードの情報が少ない | ホバー時に担当者・次回アクション日表示 |
| 重複ページ（Deals.tsx, Pipeline.tsx） | 統合またはナビゲーションで明確化 |

#### 2-C: 従業員管理 (Employees.tsx)
| 現状 | 改善案 |
|-----|-------|
| 部署・ステータスフィルターがない | フィルタードロップダウン追加 |
| 詳細ページへの動線が弱い | 行クリックで詳細表示 |

#### 2-D: グローバル検索 (GlobalSearch.tsx)
| 現状 | 改善案 |
|-----|-------|
| 検索結果のハイライトなし | マッチ文字列を太字またはハイライト表示 |
| 2文字以上で検索開始 | 日本語の場合1文字でも検索開始を検討 |

#### 2-E: ダッシュボード動線
| 現状 | 改善案 |
|-----|-------|
| カード内のアクションが限定的 | 各カードにクイックアクションボタン追加 |
| パイプラインサマリーからの遷移が弱い | クリックで該当ステージへ直接移動 |

---

## 修正計画

### Phase 1: 重要なバグ修正

| ファイル | 修正内容 | 優先度 |
|---------|---------|-------|
| `supabase/functions/chat/tools/hr.ts:16` | `list_employees`のstatus enumを`active, on_leave, resigned`に修正 | 高 |
| `supabase/functions/chat/tools/hr.ts:95` | `employee_update`のstatus enumも同様に修正 | 高 |

### Phase 2: UI改善（段階的実装）

| 改善項目 | ファイル | 工数 |
|---------|---------|-----|
| リードにステータスフィルター追加 | `src/pages/Leads.tsx` | 低 |
| リードから商談作成アクション追加 | `src/pages/Leads.tsx` | 低 |
| 商談カードのドラッグエフェクト強化 | `src/pages/Deals.tsx`, `src/pages/Pipeline.tsx` | 低 |
| 従業員にフィルター追加 | `src/pages/Employees.tsx` | 低 |
| 検索結果ハイライト | `src/components/GlobalSearch.tsx` | 中 |

---

## 技術的詳細

### 修正1: HRツール employee_status enum

```typescript
// 修正前 (hr.ts Line 16)
enum: ["active", "inactive", "on_leave"],

// 修正後
enum: ["active", "on_leave", "resigned"],
description: "ステータスでフィルタ: active(在籍), on_leave(休職中), resigned(退職)",
```

```typescript
// 修正前 (hr.ts Line 95)
enum: ["active", "inactive", "on_leave"],

// 修正後
enum: ["active", "on_leave", "resigned"],
description: "ステータス: active(在籍), on_leave(休職中), resigned(退職)",
```

### 改善1: リードにステータスフィルター追加

```typescript
// Leads.tsx に追加
const [statusFilter, setStatusFilter] = useState<string>("all");

// フィルタリングロジック更新
const filtered = leads.filter(l => {
  const matchesSearch = l.company_name.toLowerCase().includes(search.toLowerCase()) ||
    l.contact_name?.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = statusFilter === "all" || l.status === statusFilter;
  return matchesSearch && matchesStatus;
});

// UIにフィルタードロップダウン追加
<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="ステータス" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">すべて</SelectItem>
    {Object.entries(leadStatusLabels).map(([k, v]) => 
      <SelectItem key={k} value={k}>{v}</SelectItem>
    )}
  </SelectContent>
</Select>
```

### 改善2: 商談カードのドラッグエフェクト

```typescript
// Deals.tsx カードにドラッグ状態を追加
const [isDragging, setIsDragging] = useState<string | null>(null);

<Card
  key={deal.id}
  draggable
  onDragStart={(e) => {
    handleDragStart(e, deal.id);
    setIsDragging(deal.id);
  }}
  onDragEnd={() => setIsDragging(null)}
  className={cn(
    "cursor-move transition-all duration-200",
    isDragging === deal.id 
      ? "scale-105 shadow-xl opacity-75 rotate-2" 
      : "hover:shadow-md"
  )}
>
```

---

## ユーザー動線の確認結果

### 良い点
1. **グローバル検索**: Cmd+K でどこからでも検索可能
2. **モバイル対応**: ボトムナビゲーション完備
3. **AIアシスタント**: 右上とサイドバーからアクセス可能
4. **ダッシュボードカスタマイズ**: ウィジェット編集機能あり

### 改善が必要な点
1. **CRM間の遷移**: リード→商談→顧客化の流れが分かりにくい
2. **重複機能**: Deals.tsx と Pipeline.tsx が類似
3. **空状態**: データがない時の誘導が弱い
4. **クイックアクション**: 頻繁な操作（ステータス変更など）に手数がかかる

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `supabase/functions/chat/tools/hr.ts` | employee_status enum修正 |
| `src/pages/Leads.tsx` | ステータスフィルター、商談作成アクション追加 |
| `src/pages/Deals.tsx` | ドラッグエフェクト強化 |
| `src/pages/Pipeline.tsx` | ドラッグエフェクト強化 |
| `src/pages/Employees.tsx` | フィルター追加 |

---

## 期待される結果

1. **AIアシスタント経由の従業員管理が正常動作**
   - 正しいステータス値（active, on_leave, resigned）でフィルタリング可能

2. **リード管理の効率化**
   - ステータスでの絞り込みで作業効率向上
   - リードから直接商談を作成可能

3. **商談管理のUX向上**
   - ドラッグ操作の視覚フィードバックで操作性改善

4. **全体的な操作性向上**
   - 必要な情報への到達時間短縮
   - 主要動線の明確化

