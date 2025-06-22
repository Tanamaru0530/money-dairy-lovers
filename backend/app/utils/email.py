import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailSender:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_tls = settings.SMTP_TLS
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME

    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """汎用メール送信関数"""
        try:
            # メッセージの作成
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            # テキストパート
            text_part = MIMEText(body, 'plain', 'utf-8')
            msg.attach(text_part)

            # HTMLパート（オプション）
            if html_body:
                html_part = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(html_part)

            # SMTPサーバーへの接続と送信
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_tls:
                    server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_verification_email(self, to_email: str, verification_code: str) -> bool:
        """メール確認用メール送信"""
        subject = "💕 Money Dairy Lovers - メールアドレスの確認"
        
        body = f"""
こんにちは！

Money Dairy Loversへのご登録ありがとうございます💕

メールアドレスを確認するため、以下の確認コードを入力してください：

確認コード: {verification_code}

このコードは30分間有効です。

愛を込めて、
Money Dairy Lovers Team 💝
"""

        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #ec4899; text-align: center;">💕 Money Dairy Lovers</h1>
        <h2 style="color: #db2777;">メールアドレスの確認</h2>
        <p>こんにちは！</p>
        <p>Money Dairy Loversへのご登録ありがとうございます💕</p>
        <p>メールアドレスを確認するため、以下の確認コードを入力してください：</p>
        <div style="background-color: #fce7f3; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #be185d; margin: 0; font-size: 24px; letter-spacing: 5px;">{verification_code}</h3>
        </div>
        <p style="color: #6b7280; font-size: 14px;">このコードは30分間有効です。</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
            愛を込めて、<br>
            Money Dairy Lovers Team 💝
        </p>
    </div>
</body>
</html>
"""

        return self.send_email(to_email, subject, body, html_body)

    def send_password_reset_email(self, to_email: str, reset_url: str) -> bool:
        """パスワードリセット用メール送信"""
        subject = "💔 Money Dairy Lovers - パスワードリセット"
        
        body = f"""
こんにちは！

パスワードリセットのリクエストを受け付けました。

以下のリンクからパスワードをリセットできます：

{reset_url}

このリンクは1時間有効です。

もしこのリクエストに心当たりがない場合は、このメールを無視してください。

愛を込めて、
Money Dairy Lovers Team 💝
"""

        html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #ec4899; text-align: center;">💔 Money Dairy Lovers</h1>
        <h2 style="color: #db2777;">パスワードリセット</h2>
        <p>こんにちは！</p>
        <p>パスワードリセットのリクエストを受け付けました。</p>
        <p>以下のボタンをクリックしてパスワードをリセットしてください：</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #f472b6, #db2777); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                パスワードをリセット
            </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">このリンクは1時間有効です。</p>
        <p style="color: #6b7280; font-size: 14px;">もしボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：</p>
        <p style="word-break: break-all; color: #3b82f6; font-size: 12px;">{reset_url}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 12px;">
            もしこのリクエストに心当たりがない場合は、このメールを無視してください。
        </p>
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
            愛を込めて、<br>
            Money Dairy Lovers Team 💝
        </p>
    </div>
</body>
</html>
"""

        return self.send_email(to_email, subject, body, html_body)


email_sender = EmailSender()