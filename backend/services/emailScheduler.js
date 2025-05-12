const cron = require('node-cron');
const PromotionalEmail = require('../Areas/Notifications/Models/PromotionalEmail');
const User = require('../Areas/Users/Models/User');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send promotional email
const sendPromotionalEmail = async (email) => {
  try {
    let recipients = [];
    if (email.recipientType === 'all') {
      recipients = await User.find({}, 'email');
    } else if (email.recipientType === 'selected') {
      recipients = await User.find({ _id: { $in: email.recipients } }, 'email');
    } else if (email.recipientType === 'membership_tier') {
      recipients = await User.find({ membership_tier: email.membershipTier }, 'email');
    }

    const emailPromises = recipients.map(recipient => {
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: email.subject,
        html: email.content,
      });
    });

    await Promise.all(emailPromises);
    
    email.status = 'sent';
    await email.save();
    
    console.log(`Successfully sent promotional email: ${email.subject}`);
  } catch (error) {
    console.error(`Error sending promotional email: ${email.subject}`, error);
    email.status = 'failed';
    await email.save();
  }
};

// Function to check and send scheduled emails
const checkScheduledEmails = async () => {
  try {
    const now = new Date();
    const scheduledEmails = await PromotionalEmail.find({
      status: 'scheduled',
      scheduledFor: { $lte: now },
    });

    for (const email of scheduledEmails) {
      await sendPromotionalEmail(email);
    }
  } catch (error) {
    console.error('Error checking scheduled emails:', error);
  }
};

// Run the scheduler every minute
const startScheduler = () => {
  cron.schedule('* * * * *', checkScheduledEmails);
  console.log('Email scheduler started');
};

module.exports = {
  startScheduler,
  sendPromotionalEmail,
}; 