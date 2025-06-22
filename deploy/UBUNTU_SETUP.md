# Ubuntu環境でのMoney Dairy Loversセットアップ手順

## 前提条件
- Ubuntu 20.04 LTS 以上
- メモリ 2GB 以上推奨
- ストレージ 20GB 以上の空き容量

## セットアップ手順

### 1. ファイルの転送
Macから必要なファイルをUbuntuマシンに転送します。

```bash
# Macで実行（プロジェクト全体を転送）
cd /Users/t.tanaka/Documents/claude/money-dairy-lovers
scp -r . ubuntu@<UBUNTU_IP>:~/money-dairy-lovers-temp/

# または、セットアップスクリプトのみ転送
scp deploy/ubuntu-setup.sh ubuntu@<UBUNTU_IP>:~/
scp deploy/ubuntu-deploy.sh ubuntu@<UBUNTU_IP>:~/
```

### 2. Ubuntuマシンでのセットアップ

```bash
# UbuntuマシンにSSH接続
ssh ubuntu@<UBUNTU_IP>

# セットアップスクリプトを実行
chmod +x ubuntu-setup.sh
./ubuntu-setup.sh

# 一度ログアウトして再ログイン（Docker権限のため）
exit
ssh ubuntu@<UBUNTU_IP>
```

### 3. プロジェクトのデプロイ

```bash
# デプロイスクリプトを実行
chmod +x ubuntu-deploy.sh
./ubuntu-deploy.sh

# 環境変数の設定
nano ~/money-dairy-lovers/.env.production
# メール設定を追加:
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
```

### 4. 自動起動の設定（オプション）

```bash
# systemdサービスファイルをコピー
sudo cp ~/money-dairy-lovers/deploy/money-dairy-lovers.service /etc/systemd/system/

# ユーザー名を変更（ubuntuでない場合）
sudo nano /etc/systemd/system/money-dairy-lovers.service

# サービスを有効化
sudo systemctl daemon-reload
sudo systemctl enable money-dairy-lovers.service
sudo systemctl start money-dairy-lovers.service

# 状態確認
sudo systemctl status money-dairy-lovers.service
```

### 5. ファイアウォール設定（既にセットアップスクリプトで設定済み）

```bash
# 設定確認
sudo ufw status

# 必要に応じて有効化
sudo ufw enable
```

## アクセス方法

1. **Ubuntuマシンから**: http://localhost:3000
2. **同じネットワークの他のデバイスから**: http://<UBUNTU_IP>:3000

## 運用コマンド

```bash
# サービス状態確認
cd ~/money-dairy-lovers
docker compose ps

# ログ確認
docker compose logs -f

# バックアップ
docker compose exec db pg_dump -U postgres money_dairy_lovers > backup_$(date +%Y%m%d).sql

# 再起動
docker compose restart

# 停止
docker compose down
```

## トラブルシューティング

### ポートが使用中の場合
```bash
# 使用中のポートを確認
sudo lsof -i :3000
sudo lsof -i :8000

# 必要に応じてプロセスを終了
sudo kill -9 <PID>
```

### Dockerの権限エラー
```bash
# Dockerグループに追加されているか確認
groups

# 追加されていない場合
sudo usermod -aG docker $USER
# 再ログインが必要
```

### データベース接続エラー
```bash
# PostgreSQLコンテナの状態確認
docker compose logs db

# データベースに直接接続してテスト
docker compose exec db psql -U postgres -d money_dairy_lovers
```