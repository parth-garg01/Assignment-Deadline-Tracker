/**
 * Date utility functions for assignment deadline tracking
 */

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string in various formats
 * @returns {Date|null} - Parsed date or null if invalid
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try common formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/,
      /(\d{1,2})-(\d{1,2})-(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/,
      /(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/
    ];
    
    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const day = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Month is 0-indexed
        const year = parseInt(match[3]);
        const hour = match[4] ? parseInt(match[4]) : 23;
        const minute = match[5] ? parseInt(match[5]) : 59;
        
        return new Date(year, month, day, hour, minute, 0);
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return null;
  }
}

/**
 * Check if a reminder should be sent
 * @param {Date} dueDate - The assignment due date
 * @returns {boolean} - True if reminder should be sent (0 < diff <= 24 hours)
 */
function shouldSendReminder(dueDate) {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Send reminder if between 0 and 24 hours remain
  return diffHours > 0 && diffHours <= 24;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDateDisplay(date) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get time remaining until due date
 * @param {Date} dueDate - The due date
 * @returns {string} - Human readable time remaining
 */
function getTimeRemaining(dueDate) {
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Overdue';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Check if date is valid
 * @param {Date} date - Date to validate
 * @returns {boolean} - True if valid date
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
  parseDate,
  shouldSendReminder,
  formatDateDisplay,
  getTimeRemaining,
  isValidDate
};
