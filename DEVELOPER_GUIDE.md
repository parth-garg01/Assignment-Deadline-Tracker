# Deadline Sentinel - Developer Quick Reference

## 🚀 Quick Start (First Time)

```bash
# 1. Clone repository
git clone https://github.com/parth-garg01/Assignment-Deadline-Tracker.git
cd Assignment-Deadline-Tracker

# 2. Open in Chrome (chrome://extensions/)
# - Enable Developer Mode (top right)
# - Click "Load unpacked"
# - Select this folder

# 3. Set up EmailJS (https://emailjs.com)
# - Sign up for free account
# - Create email service (Gmail recommended)
# - Create email template with variables
# - Copy Public Key, Service ID, Template ID

# 4. Configure extension
# - Click extension icon
# - Click ⚙️ settings
# - Enter email and EmailJS credentials
# - Click "Send Test Email" to verify
# - Enable reminders with checkbox
# - Save Settings

# 5. Sync assignments
# - Go to VIT VTOP portal
# - Click "🔄 Sync Assignments" in popup
# - Done! Will send reminders automatically
```

---

## 📁 File Structure

```
├── manifest.json           # Extension config (Manifest V3)
├── content.js              # Portal scraper (DOM extraction)
├── background.js           # Daily checks & email sending
├── popup.html/js/css       # Dashboard UI
├── options.html/js/css     # Settings page
├── utils/
│   ├── dateUtils.js        # Date parsing & comparison
│   ├── storage.js          # chrome.storage.local wrapper
│   └── emailService.js     # EmailJS API integration
├── icons/                  # Extension icons (16x16, 48x48, 128x128)
├── README.md               # Full documentation
├── SETUP_GUIDE.md          # Step-by-step setup
└── .gitignore
```

---

## 🔧 Development Workflow

### Making Changes

1. **Edit any file** (e.g., content.js)
2. **Go to chrome://extensions/**
3. **Click refresh icon** on Deadline Sentinel card
4. **Test in new tab**

### Viewing Logs

**Popup errors:**
```
Right-click extension → Inspect popup → Console tab
```

**Background script errors:**
```
chrome://extensions/ → Deadline Sentinel → Service Worker link → Console
```

**Content script logs:**
```
VIT VTOP portal → F12 → Console tab
```

### Making Commits

After each meaningful change:
```bash
git add .
git commit -m "Clear, descriptive message"
git push origin main
```

Examples:
- "Fix date parsing for DD/MM/YYYY format"
- "Improve assignment deduplication logic"
- "Add error handling for missing portal elements"
- "Update email template variables"

---

## 🎯 How Each Component Works

### Content Script (content.js)
- **Runs on:** `https://vtop.vit.ac.in/vtop/content*`
- **Does:** Extracts assignment data from DOM tables
- **Outputs:** Array of assignment objects
- **Triggered:** When user clicks "Sync Assignments"

### Background Service Worker (background.js)
- **Runs:** In background, always
- **Does:** Checks every hour for assignments due in 24 hours
- **Triggers:** Sends email via EmailJS API
- **Prevents:** Duplicate reminders (tracks `reminderSent` flag)

### Popup Dashboard (popup.html)
- **Shows:** List of upcoming assignments
- **Has buttons:** Sync, Refresh, Settings
- **Updates:** Every time popup opens
- **Status:** Shows reminders enabled/disabled

### Options Page (options.html)
- **Stores:** User email, EmailJS credentials
- **Features:** Test email button, clear data button
- **Persists:** Data to `chrome.storage.local`

---

## 📊 Data Flow

```
User clicks "Sync Assignments"
        ↓
Popup.js sends message to background.js
        ↓
Background.js sends message to content.js
        ↓
Content.js extracts assignments from DOM
        ↓
Content.js returns array to background.js
        ↓
Background.js merges with existing assignments
        ↓
Saves to chrome.storage.local
        ↓
Updates popup display
```

---

## 🔄 Reminder Check Flow

```
Every 1 hour (chrome.alarms)
        ↓
Background.js runs checkAndSendReminders()
        ↓
Gets all assignments from storage
        ↓
For each assignment:
  - Check if dueDate - now = 0 to 24 hours
  - Check if reminderSent = false
  ↓
If both true:
  - Send email via EmailJS API
  - Set reminderSent = true
  - Save to storage
```

---

## 🔑 EmailJS Integration

### Email Sending Process

```javascript
// Template parameters sent to EmailJS
{
  to_email: user's email,
  assignment_title: "DAA Assignment 4",
  course_name: "Design and Analysis",
  due_date: "2026-05-20 11:59 PM",
  portal_url: "https://vtop.vit.ac.in/...",
  recipient_name: "user"
}

// API endpoint
POST https://api.emailjs.com/api/v1.0/email/send
```

### Setting Up Template

EmailJS Template Variables:
```
Subject: Assignment Due Tomorrow: {{assignment_title}}

Hi {{recipient_name}},
Assignment: {{assignment_title}}
Course: {{course_name}}
Due: {{due_date}}
Portal: {{portal_url}}
```

---

## 🐛 Debugging Common Issues

### No assignments found
- Check if portal page has a visible table
- Verify CSS selectors in content.js match portal HTML
- Check browser console for parsing errors

### Email not sending
- Verify EmailJS service is connected (green checkmark)
- Check credentials in settings match EmailJS dashboard
- Look for errors in background script console
- Test from EmailJS website directly

### Duplicate assignments
- Each assignment gets unique ID: `sanitized_title_dateid`
- Clear data and resync if duplicates appear
- Check if assignment details change between syncs

### Reminder not sent
- Check if 0 < (dueDate - now) ≤ 24 hours
- Verify `reminderSent` is false
- Check if reminders are enabled in settings
- Wait up to 1 hour for automatic check

---

## 🚀 Future Enhancements

Planned features (not in MVP):
- [ ] Support multiple college portals
- [ ] Google Calendar integration
- [ ] SMS/WhatsApp notifications
- [ ] Cloud sync across devices
- [ ] Notification priority levels
- [ ] Custom reminder time (not just 24h)
- [ ] Reusable reminder for missed deadlines
- [ ] Archive/snooze functionality

---

## 📝 Key Decisions Made

1. **Manifest V3** - Chrome's latest standard, required for new extensions
2. **Local storage only** - No cloud dependency, faster, more private
3. **EmailJS API** - Free tier, no backend server needed
4. **Hourly checks** - More reliable than daily (won't miss if browser closed)
5. **Vanilla JS** - No dependencies, smaller extension size
6. **Content script messaging** - Safer than modifying DOM

---

## 🔒 Security Considerations

- Credentials stored in `chrome.storage.local` (local machine only)
- Never log sensitive data to console
- Only communicates with EmailJS for sending
- No data sent to external servers except EmailJS
- Passwords stored as-is (considered acceptable for this use case as stored locally)
- HTTPS only for external API calls

---

## 📱 Testing Checklist

- [ ] Extension loads in `chrome://extensions/`
- [ ] Settings page saves and loads correctly
- [ ] Test email sends successfully
- [ ] Popup shows "Reminders Enabled" after setup
- [ ] Can sync assignments from portal
- [ ] Popup displays synced assignments
- [ ] Assignments sorted by due date
- [ ] Time remaining calculated correctly
- [ ] Reminder status shows "pending" initially
- [ ] Browser refresh doesn't lose settings
- [ ] Multiple syncs don't create duplicates

---

## 🤝 Contributing

1. Make changes
2. Test thoroughly
3. Commit with clear message
4. Push to main
5. Open issue if any problems

---

## 📧 Support

- **Email:** parth.garg10012007@gmail.com
- **GitHub Issues:** https://github.com/parth-garg01/Assignment-Deadline-Tracker/issues
- **Docs:** README.md, SETUP_GUIDE.md

---

Last Updated: May 14, 2026
Version: 1.0.0
