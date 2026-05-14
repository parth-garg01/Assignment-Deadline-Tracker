/**
 * Options page script for Deadline Sentinel
 */

// Element references
const settingsForm = document.getElementById('settingsForm');
const recipientEmailInput = document.getElementById('recipientEmail');
const publicKeyInput = document.getElementById('publicKey');
const serviceIdInput = document.getElementById('serviceId');
const templateIdInput = document.getElementById('templateId');
const enableRemindersCheckbox = document.getElementById('enableReminders');
const testEmailBtn = document.getElementById('testEmailBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const statusContainer = document.getElementById('statusContainer');

/**
 * Initialize options page
 */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  settingsForm.addEventListener('submit', handleSaveSettings);
  testEmailBtn.addEventListener('click', handleTestEmail);
  clearDataBtn.addEventListener('click', handleClearData);
}

/**
 * Load settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || {};

    recipientEmailInput.value = settings.recipientEmail || '';
    publicKeyInput.value = settings.publicKey || '';
    serviceIdInput.value = settings.serviceId || '';
    templateIdInput.value = settings.templateId || '';
    enableRemindersCheckbox.checked = settings.enableReminders !== false;
  });
}

/**
 * Handle form submission to save settings
 */
function handleSaveSettings(e) {
  e.preventDefault();

  // Validate inputs
  if (!recipientEmailInput.value) {
    showStatus('Please enter your email address', 'error');
    return;
  }

  if (!isValidEmail(recipientEmailInput.value)) {
    showStatus('Please enter a valid email address', 'error');
    return;
  }

  const settings = {
    recipientEmail: recipientEmailInput.value,
    publicKey: publicKeyInput.value,
    serviceId: serviceIdInput.value,
    templateId: templateIdInput.value,
    enableReminders: enableRemindersCheckbox.checked
  };

  // Check if EmailJS credentials are complete
  const credentialsComplete = settings.publicKey && settings.serviceId && settings.templateId;
  
  if (settings.enableReminders && !credentialsComplete) {
    showStatus('⚠️ Reminders enabled but EmailJS credentials are incomplete. Please fill in all fields.', 'warning');
  }

  // Save to storage
  chrome.storage.local.set({ settings }, () => {
    if (chrome.runtime.lastError) {
      showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
    } else {
      showStatus('✅ Settings saved successfully!', 'success');
      
      // Update popup UI if it's open
      chrome.runtime.sendMessage({ action: 'settingsUpdated' }).catch(() => {
        // Popup might not be open, ignore error
      });
    }
  });
}

/**
 * Handle test email button
 */
function handleTestEmail() {
  // Validate settings first
  if (!publicKeyInput.value || !serviceIdInput.value || !templateIdInput.value) {
    showStatus('❌ Please fill in all EmailJS credentials first', 'error');
    return;
  }

  if (!recipientEmailInput.value) {
    showStatus('❌ Please enter your email address first', 'error');
    return;
  }

  if (!isValidEmail(recipientEmailInput.value)) {
    showStatus('❌ Please enter a valid email address', 'error');
    return;
  }

  testEmailBtn.disabled = true;
  testEmailBtn.textContent = '⏳ Sending...';

  const settings = {
    publicKey: publicKeyInput.value,
    serviceId: serviceIdInput.value,
    templateId: templateIdInput.value,
    recipientEmail: recipientEmailInput.value
  };

  // Send test email via background script
  chrome.runtime.sendMessage({ action: 'sendTestEmail', settings }, (response) => {
    testEmailBtn.disabled = false;
    testEmailBtn.textContent = '📨 Send Test Email';

    if (response && response.success) {
      showStatus('✅ Test email sent successfully! Check your inbox.', 'success');
    } else {
      showStatus('❌ Failed to send test email: ' + (response?.error || 'Unknown error'), 'error');
      console.error('Test email error:', response?.error);
    }
  });
}

/**
 * Handle clear data button
 */
function handleClearData() {
  const confirmed = confirm(
    'Are you sure you want to delete all tracked assignments? This action cannot be undone.'
  );

  if (!confirmed) return;

  chrome.storage.local.get(['assignments'], (result) => {
    const count = (result.assignments || []).length;

    chrome.storage.local.set({ assignments: [] }, () => {
      showStatus(`✅ Cleared ${count} assignments from storage`, 'success');
    });
  });
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showStatus(message, type = 'info') {
  const statusEl = document.createElement('div');
  statusEl.className = `status status-${type}`;
  statusEl.textContent = message;

  statusContainer.innerHTML = '';
  statusContainer.appendChild(statusEl);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusEl.style.opacity = '0';
    setTimeout(() => statusEl.remove(), 300);
  }, 5000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
