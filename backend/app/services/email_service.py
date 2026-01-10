# email_service.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_password_reset_email(to_email: str, reset_link: str, expires_at: str) -> bool:
    """
    Send password reset email using Gmail SMTP.
    
    Args:
        to_email: Recipient email address
        reset_link: Password reset link with token
        expires_at: Token expiration time
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    
    # Get Gmail credentials from environment
    gmail_user = os.environ.get('GMAIL_USER')
    gmail_app_password = os.environ.get('GMAIL_APP_PASSWORD')
    
    # If no credentials, fall back to console logging
    if not gmail_user or not gmail_app_password:
        print("\n" + "="*80)
        print("⚠️  Gmail credentials not found - Using console logging")
        print("="*80)
        print(f"To: {to_email}")
        print(f"Reset Link: {reset_link}")
        print(f"Expires: {expires_at}")
        print("="*80 + "\n")
        return False
    
    # Create email content
    subject = "Reset Your TradeZella Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px;
                border-radius: 10px;
                text-align: center;
            }}
            .content {{
                background: white;
                padding: 30px;
                border-radius: 8px;
                margin-top: 20px;
            }}
            .button {{
                display: inline-block;
                padding: 14px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                margin-top: 20px;
            }}
            .warning {{
                background: #fff3cd;
                border: 1px solid #ffc107;
                padding: 10px;
                border-radius: 4px;
                margin-top: 20px;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1 style="color: white; margin: 0;">🔐 Password Reset Request</h1>
            
            <div class="content">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                <p>We received a request to reset your password for your TradeZella account.</p>
                <p>Click the button below to create a new password:</p>
                
                <a href="{reset_link}" class="button">Reset Password</a>
                
                <div class="warning">
                    <strong>⏰ This link expires in 1 hour</strong><br>
                    Expires at: {expires_at} UTC
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    If you didn't request this password reset, you can safely ignore this email.
                    Your password will remain unchanged.
                </p>
                
                <p style="font-size: 12px; color: #999; margin-top: 20px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="{reset_link}" style="color: #667eea; word-break: break-all;">{reset_link}</a>
                </p>
            </div>
            
            <div class="footer">
                <p>TradeZella - Your Trading Journal</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        # Create message
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = gmail_user
        message['To'] = to_email
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        # Connect to Gmail SMTP server
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(gmail_user, gmail_app_password)
            server.send_message(message)
        
        print(f"✅ Password reset email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        # Fall back to console logging
        print("\n" + "="*80)
        print("EMAIL SEND FAILED - Showing reset link in console")
        print("="*80)
        print(f"To: {to_email}")
        print(f"Reset Link: {reset_link}")
        print(f"Expires: {expires_at}")
        print("="*80 + "\n")
        return False

