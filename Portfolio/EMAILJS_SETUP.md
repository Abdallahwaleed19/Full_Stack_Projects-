# EmailJS Setup - Fill in Your Values

## 📧 **Your EmailJS Configuration**

After setting up EmailJS, replace these values in `script.js`:

### **Step 1: Get Your Values from EmailJS Dashboard**

1. **Public Key**: Go to Account → API Keys → Copy Public Key
2. **Service ID**: Go to Email Services → Copy your Gmail service ID
3. **Contact Template ID**: Go to Email Templates → Copy "Portfolio Contact" template ID
4. **Feedback Template ID**: Go to Email Templates → Copy "Portfolio Feedback" template ID

### **Step 2: Update script.js**

Replace these lines in your `script.js` file:

```javascript
// Line 1: Replace with your Public Key
emailjs.init("REPLACE_WITH_YOUR_EMAILJS_PUBLIC_KEY");

// Lines 6-10: Replace with your actual values
const EMAIL_CONFIG = {
    serviceId: "REPLACE_WITH_YOUR_SERVICE_ID",
    templateId: "REPLACE_WITH_YOUR_CONTACT_TEMPLATE_ID", 
    feedbackTemplateId: "REPLACE_WITH_YOUR_FEEDBACK_TEMPLATE_ID",
    toEmail: "waleedabdallah238@gmail.com"
};
```

### **Example (with real values):**
```javascript
emailjs.init("user_a1b2c3d4e5f6g7h8i9j0");

const EMAIL_CONFIG = {
    serviceId: "service_abc123",
    templateId: "template_xyz789",
    feedbackTemplateId: "template_feedback456",
    toEmail: "waleedabdallah238@gmail.com"
};
```

### **Step 3: Test Your Setup**

1. Go to your live website
2. Fill out the contact form
3. Submit feedback
4. Check your Gmail (waleedabdallah238@gmail.com) for emails

## ✅ **What You'll Receive:**

### **Contact Form Email:**
```
Subject: Portfolio Contact: [Subject]
From: [Name] <email@example.com>

Name: [Name]
Email: [Email] 
Subject: [Subject]

Message:
[Project request details]

---
Sent from your portfolio website
```

### **Feedback Email:**
```
Subject: New Portfolio Feedback

New feedback received from [Name] ([Title]):

Feedback: "[Message]"
Language: English/Arabic
Date: [Timestamp]

---
Sent from your portfolio website
```

## 🆘 **Need Help?**

If emails aren't working:
1. Check browser console for errors
2. Verify all EmailJS values are correct
3. Make sure EmailJS script is loaded
4. Test with a simple contact form submission
