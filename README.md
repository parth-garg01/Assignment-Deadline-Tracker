# Deadline Sentinel 📋

A Chrome extension that automatically detects assignment deadlines from your college portal and sends email reminders 24 hours before each deadline is due.

## Features

✨ **Automatic Deadline Detection** - Scrapes assignment titles and due dates from your college portal
📧 **Email Reminders** - Sends email notifications 24 hours before deadline
💾 **Local Storage** - Keeps track of assignments locally without cloud sync
🔄 **Manual Sync** - Manually refresh assignments from the portal
📅 **Dashboard** - View all tracked assignments and their due dates
⚙️ **Easy Setup** - Simple configuration with EmailJS integration

## Getting Started

### Prerequisites

- Google Chrome browser
- A college portal account (tested with VIT VTOP)
- EmailJS account (free tier available at [emailjs.com](https://www.emailjs.com))
- Gmail or other supported email service

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parth-garg01/Assignment-Deadline-Tracker.git
   cd Assignment-Deadline-Tracker
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the project directory

### Configuration

1. Click the extension icon in your Chrome toolbar
2. Click the ⚙️ settings button
3. Enter your email address where you want to receive reminders
4. Set up EmailJS credentials:
   - Visit [emailjs.com](https://www.emailjs.com) and create a free account
   - Add an Email Service (Gmail recommended)
   - Create an Email Template with these variables:
     - `{{assignment_title}}` - Name of the assignment
     - `{{course_name}}` - Course name
     - `{{due_date}}` - When the assignment is due
     - `{{portal_url}}` - Link to portal
   - Copy your Public Key, Service ID, and Template ID
5. Paste credentials in the settings page
6. Click "Send Test Email" to verify setup
7. Enable email reminders with the checkbox

### Usage

1. Navigate to your college portal's assignment page
2. Click "🔄 Sync Assignments" in the extension popup
3. The extension will extract all visible assignments
4. You'll receive email reminders 24 hours before each deadline

## Project Structure

```
Assignment-Deadline-Tracker/
├── manifest.json           # Chrome extension manifest
├── background.js           # Background service worker (handles reminders)
├── content.js              # Content script (extracts assignments)
├── popup.html              # Popup dashboard UI
├── popup.js                # Popup logic
├── popup.css               # Popup styles
├── options.html            # Settings page
├── options.js              # Settings logic
├── options.css             # Settings styles
├── utils/
│   ├── dateUtils.js        # Date parsing and comparison
│   ├── storage.js          # Chrome storage functions
│   └── emailService.js     # EmailJS integration
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## How It Works

1. **Content Script** (`content.js`)
   - Runs on VIT VTOP portal pages
   - Extracts assignment titles and due dates from the DOM
   - Sends data to background script

2. **Background Service Worker** (`background.js`)
   - Checks every hour for assignments due within 24 hours
   - Sends email reminders via EmailJS API
   - Prevents duplicate reminders
   - Manages assignment data

3. **Popup Dashboard** (`popup.html`)
   - Shows all tracked assignments
   - Displays time remaining until deadline
   - Provides manual sync button
   - Shows reminder status

4. **Settings Page** (`options.html`)
   - Stores user email and EmailJS credentials
   - Enable/disable reminders
   - Send test emails
   - Clear all data

## Data Model

Each assignment is stored with:
```json
{
  "id": "unique_assignment_id",
  "title": "Assignment Title",
  "course": "Course Name",
  "dueDate": "2026-05-20T23:59:00",
  "portalUrl": "https://vtop.vit.ac.in/...",
  "reminderSent": false,
  "createdAt": "2026-05-14T10:00:00Z",
  "updatedAt": "2026-05-14T10:00:00Z"
}
```

## Troubleshooting

### No assignments are being detected
- Make sure you're on the correct portal page (Course Dashboard)
- The extension only works on VIT VTOP (`https://vtop.vit.ac.in/vtop/content`)
- Check the browser console for errors (F12 → Console tab)

### Test email is not sending
- Verify all EmailJS credentials are correct
- Check that your email service (Gmail, etc.) is properly connected in EmailJS
- Make sure your email address is valid
- Check your spam folder

### Reminders not being sent
- Make sure "Enable Email Reminders" is checked in settings
- Verify EmailJS credentials are saved
- Check that the extension icon shows a checkmark next to "Reminders Enabled"
- The assignment due date should be more than 0 but less than 24 hours away

### Duplicate assignments showing
- Each assignment gets a unique ID based on title and due date
- Clear data and resync if duplicates appear

## Security Notes

- Credentials are stored locally in `chrome.storage.local`
- EmailJS credentials are never sent to external servers except EmailJS
- The extension does not collect any personal data
- All processing happens on your device

## Tech Stack

- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - No external dependencies in extension code
- **EmailJS** - Free email service API
- **Chrome APIs** - Storage, Alarms, Tabs, Runtime
- **HTML/CSS** - UI components

## Features Not Included (Future Enhancements)

- Google Calendar sync
- SMS/WhatsApp notifications
- Cloud synchronization
- Support for multiple college portals (easily extendable)
- Push notifications

## Supported Portals

Currently tested and working:
- **VIT VTOP** (https://vtop.vit.ac.in/)

To add support for other portals:
1. Update `manifest.json` host permissions
2. Modify `content.js` selectors to match your portal's HTML structure
3. Test and submit PR

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Testing Locally

1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test functionality in a new tab

### Debug Mode

- Right-click extension icon → "Inspect popup" to debug popup
- Go to `chrome://extensions/` → Details → "Service Worker" to see background script logs
- Open developer tools on any portal page to see content script logs

## License

This project is open source and available under the MIT License.

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Open an issue on GitHub with:
   - Steps to reproduce
   - Browser console errors
   - Screenshots if applicable
3. Check existing issues for similar problems

## Author

**Parth Garg**
- Email: parth.garg10012007@gmail.com
- GitHub: [@parth-garg01](https://github.com/parth-garg01)

## Changelog

### v1.0.0 (Initial Release)
- Automatic assignment detection from VIT VTOP
- Email reminders 24 hours before deadline
- Assignment dashboard popup
- Settings management page
- Test email functionality
- Duplicate prevention

---

Made with ❤️ for students
