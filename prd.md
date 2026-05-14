# Product Requirements Document (PRD)

## Project Title

**Deadline Sentinel – Chrome Extension for Assignment Deadline Email Reminders**

---

# 1. Product Overview

Deadline Sentinel is a Chrome extension that automatically detects assignment deadlines from a student's college portal and sends an email reminder 24 hours before each assignment is due.

The extension runs in the background and requires minimal user interaction after setup.

---

# 2. Problem Statement

Students often miss assignment deadlines because:

* Deadlines are buried inside college portals.
* Notifications are inconsistent or absent.
* Students forget to manually check the portal.
* Multiple courses have overlapping assignments.

The goal is to automate deadline tracking and reminders.

---

# 3. Objective

Build a Chrome extension that:

1. Scrapes assignment titles and due dates from a college portal.
2. Stores them locally.
3. Checks deadlines every day.
4. Sends an email reminder one day before the due date.
5. Prevents duplicate reminders.

---

# 4. Target Users

* University students
* Engineering students
* Anyone using an LMS or college portal

---

# 5. Core Features

## 5.1 Automatic Deadline Detection

* Detect assignments on supported portal pages.
* Extract:

  * Assignment title
  * Course name (optional)
  * Due date and time
  * Unique assignment identifier

## 5.2 Local Storage

Store assignment metadata in `chrome.storage.local`.

## 5.3 Daily Reminder Check

Use `chrome.alarms` to run once daily.

## 5.4 Email Notifications

Send reminder emails via [EmailJS](https://www.emailjs.com?utm_source=chatgpt.com).

## 5.5 Duplicate Prevention

Ensure each assignment generates at most one reminder for the 24-hour notification.

## 5.6 Popup Dashboard

Display:

* Upcoming assignments
* Due dates
* Reminder status
* Manual refresh button

## 5.7 Settings Page

Allow the user to:

* Enter email address
* Configure EmailJS credentials
* Enable/disable reminders

---

# 6. Functional Requirements

## FR-1: Portal Detection

The extension shall run only on specified college portal domains.

## FR-2: Assignment Extraction

The extension shall parse assignment title and due date from the DOM.

## FR-3: Assignment Persistence

The extension shall save extracted assignments.

## FR-4: Daily Alarm

The extension shall check once per day for assignments due within 24 hours.

## FR-5: Email Dispatch

The extension shall send an email reminder.

## FR-6: Duplicate Control

The extension shall mark reminders as sent.

## FR-7: Manual Refresh

The popup shall provide a “Sync Assignments” button.

## FR-8: Settings Management

The user shall be able to edit email and API credentials.

---

# 7. Non-Functional Requirements

* Manifest V3 compatible
* Runs offline except when sending emails
* Minimal resource usage
* Secure credential storage
* Responsive popup UI

---

# 8. User Stories

### US-1

As a student, I want deadlines to be extracted automatically.

### US-2

As a student, I want to receive an email one day before an assignment is due.

### US-3

As a student, I want to see all tracked assignments in the popup.

### US-4

As a student, I want to avoid duplicate reminders.

### US-5

As a student, I want to manually resync assignments.

---

# 9. Technical Architecture

## Components

1. Content Script
2. Background Service Worker
3. Popup UI
4. Options Page
5. EmailJS Integration

---

# 10. Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### APIs

* Chrome Extension APIs
* [EmailJS SDK Documentation](https://www.emailjs.com/docs/?utm_source=chatgpt.com)

---

# 11. Folder Structure

```text
deadline-sentinel/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── options.html
├── options.js
├── options.css
├── utils/
│   ├── dateUtils.js
│   ├── storage.js
│   └── emailService.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

# 12. Data Model

```json
{
  "id": "daa_assignment_4_2026-05-20T23:59:00",
  "title": "DAA Assignment 4",
  "course": "Design and Analysis of Algorithms",
  "dueDate": "2026-05-20T23:59:00",
  "portalUrl": "https://portal.example.edu",
  "reminderSent": false,
  "createdAt": "2026-05-14T10:00:00Z",
  "updatedAt": "2026-05-14T10:00:00Z"
}
```

---

# 13. Manifest Requirements

### Permissions

* `storage`
* `alarms`
* `notifications`
* `activeTab`
* `scripting`

### Host Permissions

* `https://*.yourcollege.edu/*`

---

# 14. Email Template

**Subject:** Assignment Due Tomorrow

**Body:**

* Assignment title
* Course
* Due date and time
* Portal link

---

# 15. Date Comparison Logic

Send reminder when:

* `0 < dueDate - now <= 24 hours`
* `reminderSent === false`

---

# 16. Popup UI Requirements

Show:

* Total tracked assignments
* Next upcoming deadline
* Reminder status
* Sync button
* Open settings button

---

# 17. Options Page Requirements

Fields:

* Email address
* EmailJS Public Key
* Service ID
* Template ID
* Enable reminders

Buttons:

* Save Settings
* Send Test Email

---

# 18. Security Considerations

* Store credentials in `chrome.storage.local`.
* Do not log sensitive data.
* Validate extracted dates.

---

# 19. Error Handling

| Error                    | Handling                         |
| ------------------------ | -------------------------------- |
| Portal structure changes | Show “No assignments found.”     |
| Invalid dates            | Skip entry                       |
| Email failure            | Retry next day                   |
| Missing credentials      | Prompt user to complete settings |

---

# 20. MVP Scope

Included:

* Scraping deadlines
* Local storage
* Daily email reminders
* Popup dashboard
* Settings page

Excluded:

* Google Calendar sync
* SMS/WhatsApp notifications
* Cloud sync

---

# 21. Future Enhancements

* Support multiple portals
* Push notifications
* Calendar export
* Shared accounts
* AI prioritization

---

# 22. Acceptance Criteria

1. Extension detects assignments on supported pages.
2. Assignments are saved locally.
3. Reminder email is sent 24 hours before due date.
4. Duplicate reminders are prevented.
5. Popup lists tracked assignments.
6. Settings persist after browser restart.

---

# 23. Development Milestones

### Milestone 1

Manifest and basic extension setup.

### Milestone 2

Content script extraction.

### Milestone 3

Storage integration.

### Milestone 4

Background alarms.

### Milestone 5

EmailJS integration.

### Milestone 6

Popup UI.

### Milestone 7

Options page.

### Milestone 8

Testing and packaging.

---

# 24. Testing Plan

## Unit Tests

* Date parsing
* Reminder logic

## Manual Tests

* Extraction on real portal
* Test email sending
* Duplicate prevention

---

# 25. Success Metrics

* 100% of visible assignments are detected.
* Reminder sent exactly once.
* Test email success rate > 95%.
* Popup loads in under 1 second.

---

# 26. Suggested Prompt for an LLM IDE

```text
Build a production-ready Chrome extension named "Deadline Sentinel".

Goal:
Automatically detect assignment titles and due dates from my college portal, store them in chrome.storage.local, and send an email reminder exactly 24 hours before each deadline using EmailJS.

Requirements:
- Manifest V3.
- content.js scrapes assignments from the active portal page.
- background.js uses chrome.alarms to check deadlines daily.
- popup UI displays all tracked assignments.
- options page stores EmailJS credentials and target email.
- Prevent duplicate reminders.
- Include clean modular code and comments.
- Provide a README with setup instructions.
- Use vanilla JavaScript, HTML, and CSS.
```

---

# 27. Project Name Ideas

* Deadline Sentinel
* AssignAlert
* DueDate Guardian
* SubmitSafe
* AcadReminder

---

# 28. Recommended Name

**Deadline Sentinel**

Add the following section to the PRD under **Development Workflow Requirements** and include it verbatim in the prompt you give to your LLM IDE.

---

# 29. Development Workflow Requirements

## Git and Commit Policy

The codebase must be managed using [GitHub](https://github.com?utm_source=chatgpt.com).

### Requirements

1. Initialize a Git repository at the start of the project.
2. Create a `.gitignore` file suitable for a Chrome extension project.
3. Commit changes after every meaningful feature or milestone.
4. Use realistic, human-written commit messages.
5. Push every commit to the connected GitHub repository.

### Commit Message Style

Commit messages should sound like something a developer would naturally write.

#### Good Examples

* Initial project setup
* Add manifest and basic extension structure
* Implement assignment scraping logic
* Save assignments to chrome storage
* Add daily alarm for reminder checks
* Integrate EmailJS for email notifications
* Prevent duplicate reminder emails
* Create popup to show upcoming assignments
* Add settings page for EmailJS credentials
* Improve date parsing for portal deadlines
* Add test email button
* Fix issue with duplicate assignments
* Update README with setup instructions

#### Avoid

* feat: implement FR-3
* update code
* final commit
* generated by AI

---

## Expected Commit Sequence

1. Initial project setup
2. Add manifest and folder structure
3. Implement content script for scraping assignments
4. Save extracted assignments to storage
5. Add background service worker and alarm logic
6. Integrate EmailJS
7. Prevent duplicate reminder emails
8. Create popup UI
9. Build options/settings page
10. Add test email functionality
11. Improve styling and UX
12. Update README

---

## `.gitignore`

```gitignore
node_modules/
dist/
.env
.DS_Store
Thumbs.db
```

---

## LLM IDE Prompt Addition

Append this to your implementation prompt:

```text
Use Git throughout development.

Requirements:
- Initialize a Git repository.
- Create a proper .gitignore.
- Commit after every major feature.
- Push each commit to GitHub.
- Use natural, human-like commit messages such as:
  - Initial project setup
  - Add assignment scraping logic
  - Integrate EmailJS reminders
  - Create popup dashboard
- Do not use robotic commit messages like:
  - feat: implement FR-2
  - auto-generated commit
```

---

## Why This Matters

This produces a clean and believable commit history that:

* Shows incremental development
* Makes debugging easier
* Demonstrates professional workflow
* Looks strong to recruiters reviewing your repository

---

Your LLM IDE will now:

* Build the extension feature by feature
* Commit after each milestone
* Use realistic commit messages
* Push everything to GitHub automatically (assuming the repository remote is configured)
