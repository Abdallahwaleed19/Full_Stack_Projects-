from flask import Flask
from flask_mail import Mail, Message
import os

# Create a Flask app instance
app = Flask(__name__)

# Configure email settings
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Initialize Flask-Mail
mail = Mail(app)

def test_email_send():
    print(f"Attempting to send test email to: {app.config['MAIL_DEFAULT_SENDER']}")
    print(f"Using SMTP server: {app.config['MAIL_SERVER']}:{app.config['MAIL_PORT']}")
    
    try:
        with app.app_context():
            msg = Message(
                subject="Library Management System - Test Email",
                recipients=[app.config['MAIL_DEFAULT_SENDER']],
                html="""
                <h2>Test Email from Library Management System</h2>
                <p>This is a test email to verify that the email configuration is working correctly.</p>
                <p>If you received this email, your email settings are properly configured!</p>
                """
            )
            mail.send(msg)
            print("✅ Test email sent successfully!")
            print("Please check your inbox (and spam folder) for the test email.")
    except Exception as e:
        print("❌ Error sending test email:")
        print(f"Error details: {str(e)}")
        print("\nTroubleshooting tips:")
        print("1. Make sure your environment variables are set correctly:")
        print("   - MAIL_USERNAME")
        print("   - MAIL_PASSWORD")
        print("   - MAIL_DEFAULT_SENDER")
        print("2. Verify your Gmail app password is correct")
        print("3. Make sure you're using an App Password, not your regular Gmail password")
        print("4. Check if your Gmail account has 2-Step Verification enabled")

if __name__ == '__main__':
    test_email_send() 