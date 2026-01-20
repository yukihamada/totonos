# HPKI Bridge Server

電子カルテシステムからHPKI（保健医療福祉分野公開鍵基盤）ICカードにアクセスするためのブリッジサーバーです。

## 概要

WebブラウザからはICカードリーダーに直接アクセスできないため、ローカルで動作するPythonサーバーを経由してHPKIカードの電子署名機能を利用します。

## システム要件

- Python 3.8以上
- ICカードリーダー（PC/SC対応）
- HPKIカード
- OpenSC（または互換PKCS#11ドライバ）

## セットアップ

### 1. OpenSCのインストール

#### macOS
```bash
brew install opensc
```

#### Windows
[OpenSC公式サイト](https://github.com/OpenSC/OpenSC/releases)からインストーラをダウンロード

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install opensc
```

### 2. Python依存関係のインストール

```bash
cd hpki-bridge
pip install -r requirements.txt
```

### 3. PKCS#11ドライバパスの設定

`bridge_server.py`の`PKCS11_LIB_PATH`を環境に合わせて設定します。

```python
# Windows (OpenSC)
PKCS11_LIB_PATH = r"C:\Program Files\OpenSC Project\OpenSC\pkcs11\opensc-pkcs11.dll"

# macOS (OpenSC)
PKCS11_LIB_PATH = "/usr/local/lib/opensc-pkcs11.so"
# または Homebrew の場合
PKCS11_LIB_PATH = "/opt/homebrew/lib/opensc-pkcs11.so"

# Linux (OpenSC)
PKCS11_LIB_PATH = "/usr/lib/x86_64-linux-gnu/opensc-pkcs11.so"
```

## 起動方法

```bash
cd hpki-bridge
uvicorn bridge_server:app --host 0.0.0.0 --port 8000 --reload
```

または

```bash
python bridge_server.py
```

## APIエンドポイント

### GET /health
サーバーの稼働状態を確認します。

**レスポンス:**
```json
{"status": "ok"}
```

### GET /readers
接続されているICカードリーダーの一覧を取得します。

**レスポンス:**
```json
{
  "readers": [
    {
      "name": "Reader Name",
      "hasCard": true,
      "atr": null
    }
  ]
}
```

### POST /sign
ICカードで電子署名を行います。

**リクエスト:**
```json
{
  "text_data": "署名対象のテキスト",
  "pin": "ICカードのPIN"
}
```

**レスポンス（成功時）:**
```json
{
  "signature_hex": "3045022100..."
}
```

**エラーレスポンス:**
| HTTPステータス | 説明 |
|---------------|------|
| 400 | PINが正しくありません |
| 404 | ICカードが挿入されていません |
| 500 | ドライバエラー |

## テスト方法

### ブラウザでテスト

サーバー起動後、`index.html`をブラウザで開いてテストできます。

```bash
open index.html  # macOS
start index.html # Windows
```

### curlでテスト

```bash
# ヘルスチェック
curl http://localhost:8000/health

# リーダー一覧
curl http://localhost:8000/readers

# 署名（PINを実際の値に置き換えてください）
curl -X POST http://localhost:8000/sign \
  -H "Content-Type: application/json" \
  -d '{"text_data": "test", "pin": "1234"}'
```

### APIドキュメント

サーバー起動後、以下のURLでSwagger UIにアクセスできます。

http://localhost:8000/docs

## セキュリティに関する注意

1. **PINの取り扱い**: PINはサーバーに送信後、即座に破棄されます。ログには記録されません。
2. **ローカル通信のみ**: このサーバーはlocalhostでのみ動作し、外部からのアクセスは受け付けません（CORS設定によりlocalhost以外からのアクセスを拒否）。
3. **HTTPSは不要**: ローカルホスト間通信のため、TLSは使用していません。

## トラブルシューティング

### カードリーダーが検出されない

1. リーダーがPCに正しく接続されているか確認
2. OpenSCが正しくインストールされているか確認
3. `pkcs11-tool --list-slots`コマンドでリーダーが認識されるか確認

### "PKCS#11 driver not found"エラー

`bridge_server.py`の`PKCS11_LIB_PATH`が正しいパスを指しているか確認してください。

### "PIN incorrect"エラー

正しいPINを入力してください。複数回間違えるとカードがロックされる可能性があります。

## 参考情報

- [HPKI（保健医療福祉分野公開鍵基盤）](https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryou/johoka/index.html)
- [OpenSC Project](https://github.com/OpenSC/OpenSC)
- [PyKCS11](https://github.com/LudovicRousseau/PyKCS11)
