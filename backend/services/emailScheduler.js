const cron = require('node-cron');
const PromotionalEmail = require('../Areas/Notifications/Models/PromotionalEmail');
const PromotionalEmailController = require('../Areas/Notifications/Controllers/promotionalEmailController');
const { verifyEmailConfig } = require('../config/emailConfig');

// Function to check and send scheduled emails
const checkScheduledEmails = async () => {
  try {
    const now = new Date();
    const scheduledEmails = await PromotionalEmail.find({
      status: 'scheduled',
      scheduledFor: { $lte: now },
    });

    console.log(`Found ${scheduledEmails.length} scheduled emails to send`);

    for (const email of scheduledEmails) {
      try {
        await PromotionalEmailController.sendEmail(email);
      } catch (error) {
        console.error(`Failed to send scheduled email ${email._id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking scheduled emails:', error);
  }
};

// Start the scheduler
const startScheduler = async () => {
  try {
    // Verify email configuration before starting
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      console.error('Email configuration is invalid. Scheduler not started.');
      return;
    }

    // Run the scheduler every minute
    cron.schedule('* * * * *', checkScheduledEmails);
    console.log('Email scheduler started successfully');
  } catch (error) {
    console.error('Failed to start email scheduler:', error);
  }
};

module.exports = {
  startScheduler,
}; 