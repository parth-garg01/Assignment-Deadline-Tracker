/**
 * Chrome storage utility functions
 */

const STORAGE_KEYS = {
  ASSIGNMENTS: 'assignments',
  SETTINGS: 'settings',
  LAST_SYNC: 'lastSync'
};

/**
 * Save assignments to chrome storage
 * @param {Array} assignments - Array of assignment objects
 * @returns {Promise}
 */
function saveAssignments(assignments) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.ASSIGNMENTS]: assignments }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get all saved assignments
 * @returns {Promise<Array>}
 */
function getAssignments() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEYS.ASSIGNMENTS], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[STORAGE_KEYS.ASSIGNMENTS] || []);
      }
    });
  });
}

/**
 * Add a new assignment
 * @param {Object} assignment - Assignment object
 * @returns {Promise}
 */
async function addAssignment(assignment) {
  const assignments = await getAssignments();
  
  // Check for duplicates
  const exists = assignments.some(a => a.id === assignment.id);
  if (exists) {
    throw new Error('Assignment already exists');
  }
  
  assignments.push(assignment);
  await saveAssignments(assignments);
}

/**
 * Update an assignment
 * @param {string} assignmentId - Assignment ID
 * @param {Object} updates - Fields to update
 * @returns {Promise}
 */
async function updateAssignment(assignmentId, updates) {
  const assignments = await getAssignments();
  const index = assignments.findIndex(a => a.id === assignmentId);
  
  if (index === -1) {
    throw new Error('Assignment not found');
  }
  
  assignments[index] = { ...assignments[index], ...updates };
  await saveAssignments(assignments);
}

/**
 * Save settings
 * @param {Object} settings - Settings object
 * @returns {Promise}
 */
function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get saved settings
 * @returns {Promise<Object>}
 */
function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[STORAGE_KEYS.SETTINGS] || {});
      }
    });
  });
}

/**
 * Clear all data
 * @returns {Promise}
 */
function clearAll() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get last sync timestamp
 * @returns {Promise<number>}
 */
function getLastSync() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEYS.LAST_SYNC], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[STORAGE_KEYS.LAST_SYNC] || 0);
      }
    });
  });
}

/**
 * Set last sync timestamp
 * @returns {Promise}
 */
function setLastSync() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LAST_SYNC]: Date.now() }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
