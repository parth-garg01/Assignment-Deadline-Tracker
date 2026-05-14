/**
 * Popup script for Deadline Sentinel
 */

// Element references
const totalCountEl = document.getElementById('totalCount');
const reminderStatusEl = document.getElementById('remindersStatus');
const assignmentsListEl = document.getElementById('assignmentsList');
const activityLogEl = document.getElementById('activityLog');
const lastSyncEl = document.getElementById('lastSync');
const syncBtn = document.getElementById('syncBtn');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');

/**
 * Initialize popup on load
 */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  syncBtn.addEventListener('click', handleSync);
  refreshBtn.addEventListener('click', loadData);
  settingsBtn.addEventListener('click', openSettings);
}

/**
 * Load and display data
 */
async function loadData() {
  try {
    // Get assignments from background script
    chrome.runtime.sendMessage({ action: 'getAssignments' }, (response) => {
      if (response && response.success) {
        displayAssignments(response.assignments);
        updateStatus(response.assignments);
      }
    });

    // Get settings
    chrome.storage.local.get(['settings', 'lastSync'], (result) => {
      const settings = result.settings || {};
      const lastSyncTime = result.lastSync || 0;

      // Update reminder status
      if (settings.recipientEmail && settings.enableReminders) {
        reminderStatusEl.textContent = '✅ Enabled';
        reminderStatusEl.style.color = '#4CAF50';
      } else {
        reminderStatusEl.textContent = '❌ Not configured';
        reminderStatusEl.style.color = '#f44336';
      }

      // Update last sync time
      if (lastSyncTime > 0) {
        const date = new Date(lastSyncTime);
        lastSyncEl.textContent = formatTimeAgo(date);
      } else {
        lastSyncEl.textContent = 'Never';
      }
    });
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

/**
 * Display assignments in UI
 * @param {Array} assignments - Array of assignment objects
 */
function displayAssignments(assignments) {
  // Sort by due date
  const sorted = assignments.sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  if (sorted.length === 0) {
    assignmentsListEl.innerHTML = '<div class="placeholder">No assignments tracked yet. Click "Sync Assignments" to get started.</div>';
    return;
  }

  // Display only upcoming assignments (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingAssignments = sorted.filter(a => {
    const dueDate = new Date(a.dueDate);
    return dueDate >= now && dueDate <= nextWeek;
  });

  assignmentsListEl.innerHTML = '';

  if (upcomingAssignments.length === 0) {
    assignmentsListEl.innerHTML = '<div class="placeholder">No assignments due in the next 7 days</div>';
  } else {
    upcomingAssignments.forEach(assignment => {
      const el = createAssignmentElement(assignment);
      assignmentsListEl.appendChild(el);
    });
  }
}

/**
 * Create assignment element
 * @param {Object} assignment - Assignment object
 * @returns {HTMLElement}
 */
function createAssignmentElement(assignment) {
  const div = document.createElement('div');
  div.className = 'assignment-item';

  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Color based on urgency
  let urgencyClass = 'low';
  if (diffHours <= 24) urgencyClass = 'high';
  else if (diffHours <= 72) urgencyClass = 'medium';

  const timeRemaining = getTimeRemaining(dueDate);

  div.innerHTML = `
    <div class="assignment-header">
      <h3>${escapeHtml(assignment.title)}</h3>
      <span class="urgency ${urgencyClass}">${timeRemaining}</span>
    </div>
    <div class="assignment-details">
      <p><strong>Course:</strong> ${escapeHtml(assignment.course)}</p>
      <p><strong>Due:</strong> ${formatDateDisplay(dueDate)}</p>
    </div>
    <div class="assignment-footer">
      <span class="reminder-status ${assignment.reminderSent ? 'sent' : 'pending'}">
        ${assignment.reminderSent ? '✓ Reminder sent' : '⏳ Awaiting reminder'}
      </span>
    </div>
  `;

  return div;
}

/**
 * Update status information
 * @param {Array} assignments - Array of assignments
 */
function updateStatus(assignments) {
  totalCountEl.textContent = assignments.length;
}

/**
 * Handle sync button click
 */
function handleSync() {
  syncBtn.disabled = true;
  syncBtn.textContent = '⌛ Syncing...';

  chrome.runtime.sendMessage({ action: 'syncAssignments' }, (response) => {
    syncBtn.disabled = false;
    syncBtn.textContent = '🔄 Sync Assignments';

    if (response && response.success) {
      // Update last sync time
      chrome.storage.local.set({ lastSync: Date.now() });
      loadData();
      showNotification('Sync completed: ' + response.message, 'success');
    } else {
      showNotification('Sync failed: ' + (response?.error || 'Unknown error'), 'error');
    }
  });
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Get time remaining until due date
 * @param {Date} dueDate - Due date
 * @returns {string} - Formatted time remaining
 */
function getTimeRemaining(dueDate) {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();

  if (diffMs < 0) return 'Overdue';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string}
 */
function formatDateDisplay(date) {
  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format time as "X minutes ago", "X hours ago", etc.
 * @param {Date} date - Date to format
 * @returns {string}
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Show notification
 * @param {string} message - Message to show
 * @param {string} type - 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to page
  document.body.insertBefore(notification, document.body.firstChild);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
