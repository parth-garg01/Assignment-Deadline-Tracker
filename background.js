/**
 * Background service worker for Deadline Sentinel
 * Manages daily deadline checks and reminder emails
 */

const REMINDER_ALARM_NAME = 'reminderCheck';
const ALARM_INTERVAL_MINUTES = 60; // Check every hour (more reliable than daily)

/**
 * Initialize background service worker
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details);
  
  // Set up the alarm for checking deadlines
  chrome.alarms.create(REMINDER_ALARM_NAME, {
    periodInMinutes: ALARM_INTERVAL_MINUTES
  });
  
  // Open options page on first install
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

/**
 * Handle alarm trigger for deadline checks
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REMINDER_ALARM_NAME) {
    checkAndSendReminders();
  }
});

/**
 * Check assignments and send reminders if needed
 */
async function checkAndSendReminders() {
  try {
    console.log('Starting reminder check...');
    
    // Get assignments from storage
    const assignments = await getAssignmentsFromStorage();
    console.log(`Checking ${assignments.length} assignments`);
    
    // Get settings
    const settings = await getSettingsFromStorage();
    
    if (!settings.recipientEmail || !settings.enableReminders) {
      console.log('Email reminders not configured or disabled');
      return;
    }
    
    // Check each assignment
    for (const assignment of assignments) {
      try {
        if (shouldSendReminder(assignment)) {
          console.log(`Sending reminder for: ${assignment.title}`);
          
          // Send email
          await sendEmailReminder(assignment, settings);
          
          // Mark as sent
          await markReminderAsSent(assignment.id);
          
          console.log(`Reminder sent for: ${assignment.title}`);
        }
      } catch (error) {
        console.error(`Failed to send reminder for ${assignment.title}:`, error);
      }
    }
    
    console.log('Reminder check completed');
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}

/**
 * Check if reminder should be sent for assignment
 * @param {Object} assignment - Assignment object
 * @returns {boolean} - True if reminder should be sent
 */
function shouldSendReminder(assignment) {
  // Don't send if already sent
  if (assignment.reminderSent) {
    return false;
  }
  
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  
  // Invalid date
  if (isNaN(dueDate.getTime())) {
    console.warn(`Invalid date for assignment: ${assignment.title}`);
    return false;
  }
  
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Send reminder if between 0 and 24 hours remain
  const shouldSend = diffHours > 0 && diffHours <= 24;
  
  if (shouldSend) {
    console.log(`Assignment "${assignment.title}" is due in ${diffHours.toFixed(2)} hours`);
  }
  
  return shouldSend;
}

/**
 * Send email reminder via EmailJS
 * @param {Object} assignment - Assignment object
 * @param {Object} settings - User settings
 * @returns {Promise}
 */
async function sendEmailReminder(assignment, settings) {
  // Check if EmailJS credentials are configured
  if (!settings.publicKey || !settings.serviceId || !settings.templateId) {
    throw new Error('EmailJS credentials not configured');
  }
  
  // Prepare email data
  const emailData = {
    service_id: settings.serviceId,
    template_id: settings.templateId,
    user_id: settings.publicKey,
    template_params: {
      to_email: settings.recipientEmail,
      assignment_title: assignment.title,
      course_name: assignment.course || 'Assignment',
      due_date: formatDateForEmail(new Date(assignment.dueDate)),
      portal_url: assignment.portalUrl,
      recipient_name: settings.recipientEmail.split('@')[0]
    }
  };
  
  // Send via EmailJS REST API
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`EmailJS error: ${error}`);
  }
  
  return response.json();
}

/**
 * Format date for email
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateForEmail(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get assignments from storage
 * @returns {Promise<Array>}
 */
function getAssignmentsFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['assignments'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.assignments || []);
      }
    });
  });
}

/**
 * Get settings from storage
 * @returns {Promise<Object>}
 */
function getSettingsFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['settings'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.settings || {});
      }
    });
  });
}

/**
 * Mark reminder as sent
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise}
 */
async function markReminderAsSent(assignmentId) {
  const assignments = await getAssignmentsFromStorage();
  const index = assignments.findIndex(a => a.id === assignmentId);
  
  if (index !== -1) {
    assignments[index].reminderSent = true;
    assignments[index].updatedAt = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ assignments }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * Listen for messages from popup/options pages
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncAssignments') {
    // Message content script to extract assignments
    chrome.tabs.query({ url: 'https://vtop.vit.ac.in/vtop/content*' }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ 
          success: false, 
          error: 'No VIT portal tab found. Please open the portal first.' 
        });
        return;
      }
      
      // Send message to content script
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractAssignments' }, 
        async (response) => {
          if (!response || !response.success) {
            sendResponse({ 
              success: false, 
              error: response?.error || 'Failed to extract assignments' 
            });
            return;
          }
          
          try {
            // Save extracted assignments
            const assignments = await mergeAssignments(response.assignments);
            sendResponse({ 
              success: true, 
              message: `Successfully synced ${assignments.length} assignments`,
              assignments: assignments
            });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
        });
    });
    
    // Return true to indicate we'll send response asynchronously
    return true;
  } else if (request.action === 'getAssignments') {
    getAssignmentsFromStorage().then(assignments => {
      sendResponse({ success: true, assignments });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'sendTestEmail') {
    sendTestEmail(request.settings).then(() => {
      sendResponse({ success: true, message: 'Test email sent' });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

/**
 * Merge extracted assignments with existing ones
 * @param {Array} newAssignments - Newly extracted assignments
 * @returns {Promise<Array>} - Merged assignments
 */
async function mergeAssignments(newAssignments) {
  const existing = await getAssignmentsFromStorage();
  
  // Keep existing assignments, add new ones, update if already exists
  const merged = [...existing];
  
  for (const newAssignment of newAssignments) {
    const index = merged.findIndex(a => a.id === newAssignment.id);
    
    if (index === -1) {
      // New assignment
      merged.push(newAssignment);
    } else {
      // Update existing (but preserve reminderSent flag if already sent)
      merged[index] = {
        ...newAssignment,
        reminderSent: merged[index].reminderSent,
        createdAt: merged[index].createdAt
      };
    }
  }
  
  // Save merged assignments
  await new Promise((resolve, reject) => {
    chrome.storage.local.set({ assignments: merged }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
  
  return merged;
}

/**
 * Send test email
 * @param {Object} settings - User settings
 * @returns {Promise}
 */
async function sendTestEmail(settings) {
  const testAssignment = {
    title: 'Test Assignment - Delete Me',
    course: 'Deadline Sentinel',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    portalUrl: 'https://vtop.vit.ac.in/vtop/content'
  };
  
  return sendEmailReminder(testAssignment, settings);
}

console.log('Deadline Sentinel background service worker loaded');
