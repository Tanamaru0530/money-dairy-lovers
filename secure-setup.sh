#!/bin/bash

echo "🔒 Money Dairy Lovers - セキュリティ設定 🔒"
echo "==========================================="

# SECRET_KEY の生成
echo "🔑 SECRET_KEY を生成中..."
NEW_SECRET_KEY=$(openssl rand -base64 32)
echo "生成されたSECRET_KEY: $NEW_SECRET_KEY"

# .env.production の更新を促す
echo ""
echo "📝 以下の手順で設定を更新してください:"
echo ""
echo "1. .env.production を開く"
echo "2. SECRET_KEY を以下に置き換える:"
echo "   SECRET_KEY=$NEW_SECRET_KEY"
echo ""
echo "3. SMTP_PASSWORD を設定:"
echo "   a. https://myaccount.google.com/apppasswords にアクセス"
echo "   b. 2段階認証を有効化"
echo "   c. アプリパスワードを生成"
echo "   d. 生成された16文字のパスワードを設定"
echo ""
echo "4. データベースパスワードを変更（オプション）:"
echo "   現在: LovePassword2025!"
echo "   推奨: より強力なパスワードに変更"
echo ""

# ローカルIPアドレスの取得
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "5. ローカルネットワーク設定:"
echo "   あなたのローカルIP: $LOCAL_IP"
echo "   同じネットワークの他のデバイスからアクセスする場合:"
echo "   - BACKEND_URL=http://$LOCAL_IP:8000"
echo "   - FRONTEND_URL=http://$LOCAL_IP:3000"
echo "   - CORS_ORIGINS に http://$LOCAL_IP:3000 を追加"
echo ""

# ファイアウォール設定の確認
echo "6. macOS ファイアウォール設定:"
echo "   システム設定 > ネットワーク > ファイアウォール"
echo "   - Docker Desktop を許可"
echo "   - ポート 3000, 8000 へのアクセスを許可"
echo ""

echo "✅ セキュリティ設定の準備が完了しました！"
echo "設定が終わったら ./start-production.sh を実行してください。"