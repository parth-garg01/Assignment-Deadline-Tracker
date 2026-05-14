/**
 * Content script for extracting assignments from VIT VTOP portal
 */

/**
 * Extract assignments from the current portal page
 * @returns {Array} - Array of extracted assignment objects
 */
function extractAssignments() {
  const assignments = [];
  
  // Look for assignment tables on the page
  // VIT VTOP typically displays assignments in tables with class names like 'table', 'assignment-table', etc.
  const tables = document.querySelectorAll('table');
  
  tables.forEach((table) => {
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach((row) => {
      try {
        const cells = row.querySelectorAll('td');
        
        if (cells.length >= 2) {
          // Common portal structure:
          // Cell 0: Assignment Title
          // Cell 1: Course (may be in header or separate cell)
          // Last cells: Due Date
          
          const titleCell = cells[0];
          const dateCell = cells[cells.length - 1];
          
          if (titleCell && dateCell) {
            const title = titleCell.textContent.trim();
            const dueDate = extractDateFromCell(dateCell);
            
            if (title && dueDate) {
              const course = extractCourseFromRow(row);
              const assignment = createAssignmentObject(title, course, dueDate);
              
              // Avoid duplicates
              if (!assignments.some(a => a.id === assignment.id)) {
                assignments.push(assignment);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error parsing assignment row:', e);
      }
    });
  });
  
  // If no tables found, try to extract from divs (alternative portal structure)
  if (assignments.length === 0) {
    assignments.push(...extractAssignmentsFromDivs());
  }
  
  return assignments;
}

/**
 * Extract date from table cell
 * @param {HTMLElement} cell - Table cell element
 * @returns {string|null} - Date string or null
 */
function extractDateFromCell(cell) {
  const text = cell.textContent.trim();
  
  // Try to find date patterns
  // Patterns: DD/MM/YYYY, DD-MM-YYYY, etc. with optional time
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:(\d{1,2}):(\d{2}))?/,
    /(\d{1,2}-\d{1,2}-\d{4})\s*(?:(\d{1,2}):(\d{2}))?/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
}

/**
 * Extract course name from row (check header or nearby cells)
 * @param {HTMLElement} row - Table row element
 * @returns {string} - Course name or empty string
 */
function extractCourseFromRow(row) {
  // Check if there's a course column in the row
  const cells = row.querySelectorAll('td');
  
  // Typically course is in first or second cell if not assignment title
  if (cells.length >= 2) {
    const potentialCourse = cells[1].textContent.trim();
    // Check if it looks like a course name (not a date)
    if (potentialCourse && !/\d{1,2}\/\d{1,2}\/\d{4}/.test(potentialCourse)) {
      return potentialCourse;
    }
  }
  
  // Try to find course from table header or page context
  const tableHead = row.closest('table')?.querySelector('thead');
  if (tableHead) {
    const headerCells = tableHead.querySelectorAll('th');
    if (headerCells.length >= 2) {
      return headerCells[1].textContent.trim();
    }
  }
  
  return '';
}

/**
 * Extract assignments from div-based layouts
 * @returns {Array} - Array of assignment objects
 */
function extractAssignmentsFromDivs() {
  const assignments = [];
  
  // Look for assignment containers with common class names
  const containerSelectors = [
    '.assignment',
    '.assignment-item',
    '[data-assignment]',
    '.task',
    '.submission'
  ];
  
  for (const selector of containerSelectors) {
    const containers = document.querySelectorAll(selector);
    
    if (containers.length > 0) {
      containers.forEach((container) => {
        try {
          const title = container.querySelector('.title, .name, h3, h4')?.textContent.trim() || '';
          const dueDate = extractDateFromElement(container);
          
          if (title && dueDate) {
            const course = container.querySelector('.course, .subject')?.textContent.trim() || '';
            const assignment = createAssignmentObject(title, course, dueDate);
            
            if (!assignments.some(a => a.id === assignment.id)) {
              assignments.push(assignment);
            }
          }
        } catch (e) {
          console.error('Error parsing assignment div:', e);
        }
      });
      
      if (assignments.length > 0) break;
    }
  }
  
  return assignments;
}

/**
 * Extract date from element content
 * @param {HTMLElement} element - Element to search
 * @returns {string|null} - Date string or null
 */
function extractDateFromElement(element) {
  const dateSelectors = ['.due-date', '.deadline', '[data-due-date]', '.date'];
  
  for (const selector of dateSelectors) {
    const dateEl = element.querySelector(selector);
    if (dateEl) {
      const date = extractDateFromCell(dateEl);
      if (date) return date;
    }
  }
  
  // Search in text content
  const text = element.textContent;
  const patterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{1,2}-\d{1,2}-\d{4})/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Create assignment object
 * @param {string} title - Assignment title
 * @param {string} course - Course name
 * @param {string} dueDate - Due date string
 * @returns {Object} - Assignment object
 */
function createAssignmentObject(title, course, dueDate) {
  // Parse date string to ISO format
  const parsedDate = parsePortalDate(dueDate);
  
  return {
    id: generateAssignmentId(title, dueDate),
    title: title,
    course: course || 'Assignment',
    dueDate: parsedDate || dueDate,
    portalUrl: window.location.href,
    reminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Parse date string from portal (typically DD/MM/YYYY format)
 * @param {string} dateStr - Date string
 * @returns {string} - ISO format date string
 */
function parsePortalDate(dateStr) {
  // Handle DD/MM/YYYY format
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    const hour = (match[4] || '23').padStart(2, '0');
    const minute = (match[5] || '59').padStart(2, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }
  
  // Handle DD-MM-YYYY format
  const match2 = dateStr.match(/(\d{1,2})-(\d{1,2})-(\d{4})\s*(?:(\d{1,2}):(\d{2}))?/);
  if (match2) {
    const day = match2[1].padStart(2, '0');
    const month = match2[2].padStart(2, '0');
    const year = match2[3];
    const hour = (match2[4] || '23').padStart(2, '0');
    const minute = (match2[5] || '59').padStart(2, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }
  
  return null;
}

/**
 * Generate unique assignment ID
 * @param {string} title - Assignment title
 * @param {string} dueDate - Due date
 * @returns {string} - Unique ID
 */
function generateAssignmentId(title, dueDate) {
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20);
  const dateId = dueDate.replace(/[^0-9]/g, '');
  return `${sanitized}_${dateId}`;
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractAssignments') {
    try {
      const assignments = extractAssignments();
      sendResponse({ success: true, assignments: assignments });
    } catch (error) {
      console.error('Error extracting assignments:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

// Log that content script is loaded
console.log('Deadline Sentinel content script loaded for', window.location.href);
