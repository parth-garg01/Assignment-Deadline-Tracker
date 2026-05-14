# Deadline Sentinel - Complete Setup Guide

## Table of Contents
1. [EmailJS Setup](#emailjs-setup)
2. [Chrome Extension Installation](#chrome-extension-installation)
3. [Configuration in Extension](#configuration-in-extension)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## EmailJS Setup

EmailJS is a free service that allows the extension to send emails without requiring a backend server.

### Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com
2. Click **"Sign Up"** (free tier available)
3. Create account with your preferred email
4. Verify email address

### Step 2: Add Email Service

1. In EmailJS dashboard, click **"Email Services"**
2. Click **"Add Service"**
3. Select your email provider:
   - **Gmail** (recommended - free tier works)
   - Outlook
   - Yahoo
   - SendGrid
   - Custom SMTP
4. Click **"Connect Account"**
5. Authorize EmailJS to send from your account
6. Note your **Service ID** (looks like `service_xxxxx`)

### Step 3: Create Email Template

1. In EmailJS dashboard, click **"Email Templates"**
2. Click **"Create New Template"**
3. Set template name: `Assignment_Deadline_Reminder`
4. In the email body, use these variables:
   ```
   Subject: Assignment Due Tomorrow: {{assignment_title}}
   
   Hi {{recipient_name}},
   
   This is a reminder that your assignment is due soon!
   
   📋 Assignment: {{assignment_title}}
   📚 Course: {{course_name}}
   ⏰ Due Date: {{due_date}}
   
   Click here to go to your portal: {{portal_url}}
   
   Don't miss the deadline!
   
   Best regards,
   Deadline Sentinel
   ```
5. Click **"Save"**
6. Note your **Template ID** (looks like `template_xxxxx`)

### Step 4: Get Your Public Key

1. In EmailJS dashboard, click **"Account"**
2. Scroll to **"API Keys"**
3. Copy your **Public Key** (looks like `xxxxxxxxxxxxx`)

### Summary: Keys You Need

You should now have:
- ✅ Service ID (from Email Services)
- ✅ Template ID (from Email Templates)
- ✅ Public Key (from Account)
- ✅ Recipient Email (your email address)

---

## Chrome Extension Installation

### Method 1: Load Unpacked (For Development)

1. **Download or Clone Repository**
   ```bash
   git clone https://github.com/parth-garg01/Assignment-Deadline-Tracker.git
   ```
   Or download ZIP and extract

2. **Open Chrome Extensions**
   - Type `chrome://extensions/` in address bar
   - OR: Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle **"Developer mode"** (top right corner)

4. **Load Extension**
   - Click **"Load unpacked"**
   - Navigate to the extracted folder
   - Select the folder and click **"Select Folder"**

5. **Verify Installation**
   - You should see "Deadline Sentinel" in extensions list
   - Click extension icon in toolbar (pin if needed)

### Method 2: Package for Distribution (Future)

When ready to publish to Chrome Web Store:
```bash
# Create .zip package
# Go to chrome://extensions/
# Upload to Chrome Web Store
```

---

## Configuration in Extension

### Initial Setup

1. **Click Extension Icon**
   - Look for Deadline Sentinel in your toolbar
   - If you don't see it, click the puzzle icon and pin it

2. **Click Settings (⚙️ button)**
   - Opens the options/settings page

3. **Enter Email Address**
   - Your email where reminders will be sent
   - Example: `parth.garg10012007@gmail.com`
   - ⚠️ This should be the email you verified with EmailJS

4. **Enter EmailJS Credentials**
   - **Public Key**: From your Account
   - **Service ID**: From your Email Services
   - **Template ID**: From your Email Templates

5. **Enable Reminders**
   - Check the checkbox: **"Enable Email Reminders"**

6. **Click "💾 Save Settings"**
   - You should see: ✅ Settings saved successfully!

### Verify Configuration

1. **Send Test Email**
   - Click **"📨 Send Test Email"** button
   - Check your email inbox (check spam folder too)
   - If successful, you should receive a test email

2. **Check Status in Popup**
   - Click extension icon
   - You should see: ✅ Reminders Enabled
   - If not, verify credentials in settings

---

## Testing

### Test 1: Sync Assignments

1. **Open VIT VTOP Portal**
   - Go to https://vtop.vit.ac.in/vtop/content
   - Navigate to: Academics → Digital Assignment Upload → Choose Semester → Courses → Course Dashboard
   - You should see a list of assignments with due dates

2. **Sync Assignments**
   - Click extension icon
   - Click **"🔄 Sync Assignments"** button
   - Wait for "Sync completed" message
   - You should see assignments listed in the popup

### Test 2: Test Email

1. **Send Test Email**
   - Click extension icon
   - Click ⚙️ settings button
   - Click **"📨 Send Test Email"**
   - Check email inbox within 30 seconds
   - If you don't receive it:
     - Check spam folder
     - Verify EmailJS credentials
     - Check browser console for errors (F12)

### Test 3: Real Reminder

1. **Create Test Assignment** (in VIT portal)
   - Or wait for an assignment due within 24 hours

2. **Wait for Automatic Check**
   - Extension checks every hour
   - For faster testing, you can manually trigger:
     - Open browser console (F12)
     - In extension service worker console, refresh the page
     - Or wait up to 1 hour for automatic check

3. **Check Email**
   - You should receive reminder email 24 hours before deadline

---

## Troubleshooting

### Issue: Extension doesn't appear in toolbar

**Solution:**
1. Go to `chrome://extensions/`
2. Search for "Deadline Sentinel"
3. Toggle ON to enable it
4. Click puzzle icon and pin it for easy access

### Issue: No assignments detected

**Possible causes:**
- Wrong portal page
  - Solution: Make sure you're on Course Dashboard with assignments visible
  - URL should be: `https://vtop.vit.ac.in/vtop/content...`

- Portal structure changed
  - Solution: Open browser console (F12 → Console tab)
  - Look for error messages
  - Report issue on GitHub with screenshot

**Try this:**
1. Right-click on assignment element
2. Select "Inspect"
3. Check the HTML structure
4. Compare with content.js selectors

### Issue: Test email not sending

**Check these in order:**

1. **Verify settings are saved**
   - Click ⚙️ settings
   - Check all fields are filled in
   - Check reminders are enabled
   - Try clicking "Save Settings" again

2. **Verify EmailJS setup**
   - Go to https://www.emailjs.com/dashboard
   - Check Service is enabled (green checkmark)
   - Check Template is created
   - Try sending test from EmailJS website

3. **Check browser console**
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Common errors:
     - "Invalid credentials" → Check Public Key
     - "Service not found" → Check Service ID
     - "Template not found" → Check Template ID

4. **Check email address**
   - Make sure it's valid format
   - Match the email you authorized with EmailJS
   - Check spam/promotions folder

### Issue: Reminders showing as "Not configured"

**Solution:**
1. Go to settings (⚙️)
2. Fill in email address
3. Fill in EmailJS credentials
4. Check "Enable Email Reminders" checkbox
5. Click "Save Settings"
6. Close and reopen popup - should show ✅

### Issue: Duplicate assignments

**Solution:**
1. Click ⚙️ settings
2. Click **"🗑️ Clear All Data"**
3. Click "OK" to confirm
4. Do a fresh sync

### Issue: Extension keeps syncing but finds no assignments

**Try this:**
1. Go to VIT portal
2. Make sure you see a table with assignment names and dates
3. Right-click on assignment name → Inspect
4. Look at the HTML structure
5. If structure is different from what content.js expects:
   - Report issue on GitHub
   - Include screenshot of HTML structure

---

## Chrome Developer Tools Debugging

### View Popup Errors
```
1. Right-click extension icon
2. Select "Inspect popup"
3. Look at Console tab for errors
4. Check Network tab for failed requests
```

### View Background Script Logs
```
1. Go to chrome://extensions/
2. Find Deadline Sentinel
3. Click "Service Worker" link
4. Look at Console tab
5. Check logs for "Checking X assignments", etc.
```

### View Content Script Logs
```
1. Go to VIT VTOP portal
2. Press F12 for developer tools
3. Go to Console tab
4. Look for logs starting with "Deadline Sentinel"
```

---

## Important Notes

⚠️ **Security:**
- Never share your EmailJS Public Key publicly
- Credentials are stored locally on your computer
- The extension doesn't send your data to external servers except EmailJS

⚠️ **EmailJS Free Tier:**
- Limited to 200 emails/month (free tier)
- Should be plenty for your courses
- Paid tiers available if needed

⚠️ **Portal Compatibility:**
- Currently works with VIT VTOP
- If your college uses different LMS:
  - The extension architecture supports it
  - May need to adjust CSS selectors in `content.js`
  - Open an issue if you want support added

---

## Getting Help

If you encounter issues:

1. **Check troubleshooting section above**
2. **Search GitHub issues**: https://github.com/parth-garg01/Assignment-Deadline-Tracker/issues
3. **Open new issue** with:
   - Description of problem
   - Steps to reproduce
   - Browser console errors (F12 → Console)
   - Browser version (chrome://version/)
   - Screenshots if applicable

---

## Useful Resources

- **Chrome Extensions Documentation**: https://developer.chrome.com/docs/extensions/
- **EmailJS Documentation**: https://www.emailjs.com/docs/
- **JavaScript Date Parsing**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

---

## Support & Contact

**Need help?**
- Email: parth.garg10012007@gmail.com
- GitHub: [@parth-garg01](https://github.com/parth-garg01)

**Found a bug?**
- Open issue on GitHub
- Include reproduction steps and error messages

---

Last Updated: May 14, 2026
Version: 1.0.0
