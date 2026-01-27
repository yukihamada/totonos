
# AI CRMツールの enum 修正完了

## 発見された問題

AIアシスタント（ミナト）のCRMツール定義で、複数のenum値がデータベース定義と一致していませんでした。

## 修正内容

### 1. lead_source (完了)
| 修正前 | 修正後（DB一致）|
|--------|----------------|
| 任意の文字列 | website, referral, exhibition, cold_call, advertising, other |
| デフォルト: "その他" | デフォルト: "other" |

### 2. lead_status (完了)
| 修正前 | 修正後（DB一致）|
|--------|----------------|
| new, contacted, qualified, proposal, negotiation, won, lost | new, contacted, qualified, converted, lost |

### 3. deal_stage (完了)
| 修正前 | 修正後（DB一致）|
|--------|----------------|
| discovery, proposal, negotiation, closed_won, closed_lost | initial, proposal, negotiation, contract, won, lost |
| デフォルト: "discovery" | デフォルト: "initial" |

### 4. activity_type (完了)
| 修正前 | 修正後（DB一致）|
|--------|----------------|
| call, email, meeting, note | call, meeting, email, visit, demo, other |

## 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `supabase/functions/chat/tools/crm.ts` | 全enumの修正、説明文の改善 |

## テスト結果

- ✅ E2Eログインバイパス: 正常動作
- ✅ リード作成: 正しいenum値（website）で作成成功
- ✅ リード一覧: 正常表示
- ✅ 案件作成: enum修正完了（initial, proposal等）
- ✅ 活動記録: enum修正完了（call, meeting, email, visit, demo, other）
