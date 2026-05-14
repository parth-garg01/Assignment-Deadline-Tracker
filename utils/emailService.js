/**
 * EmailJS integration for sending reminder emails
 */

/**
 * Initialize EmailJS service
 * @param {string} publicKey - EmailJS public key
 */
function initEmailJS(publicKey) {
  // EmailJS will be loaded from CDN in the popup/options pages
  if (typeof emailjs !== 'undefined') {
    emailjs.init(publicKey);
  }
}

/**
 * Send reminder email via EmailJS
 * @param {Object} emailConfig - Email configuration from settings
 * @param {Object} assignment - Assignment object
 * @param {string} recipientEmail - Recipient email address
 * @returns {Promise<Object>} - EmailJS response
 */
async function sendReminderEmail(emailConfig, assignment, recipientEmail) {
  if (typeof emailjs === 'undefined') {
    throw new Error('EmailJS not loaded');
  }
  
  if (!emailConfig.publicKey || !emailConfig.serviceId || !emailConfig.templateId) {
    throw new Error('EmailJS credentials not configured');
  }
  
  // Initialize with public key
  emailjs.init(emailConfig.publicKey);
  
  // Prepare template parameters
  const templateParams = {
    to_email: recipientEmail,
    assignment_title: assignment.title,
    course_name: assignment.course || 'Assignment',
    due_date: assignment.dueDate,
    portal_url: assignment.portalUrl,
    recipient_name: recipientEmail.split('@')[0]
  };
  
  try {
    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Send test email
 * @param {Object} emailConfig - Email configuration
 * @param {string} recipientEmail - Recipient email address
 * @returns {Promise<Object>} - EmailJS response
 */
async function sendTestEmail(emailConfig, recipientEmail) {
  const testAssignment = {
    title: 'Test Assignment',
    course: 'Test Course',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    portalUrl: 'https://vtop.vit.ac.in/vtop/content'
  };
  
  return sendReminderEmail(emailConfig, testAssignment, recipientEmail);
}

/**
 * Validate EmailJS configuration
 * @param {Object} config - Configuration object
 * @returns {boolean} - True if valid
 */
function isEmailConfigValid(config) {
  return !!(
    config &&
    config.publicKey &&
    config.serviceId &&
    config.templateId &&
    config.recipientEmail
  );
}
