const express = require('express');
const router = express.Router();
const PromotionalEmail = require('../Models/PromotionalEmail');
const User = require('../../Users/Models/User');
const { isAdmin } = require('../../../middlewares/adminAuth');
const nodemailer = require('nodemailer');

// Create a new promotional email
router.post('/', isAdmin, async (req, res) => {
  try {
    const { subject, content, scheduledFor, recipientType, recipients, membershipTier } = req.body;
    
    const promotionalEmail = new PromotionalEmail({
      subject,
      content,
      scheduledFor,
      recipientType,
      recipients: recipientType === 'selected' ? recipients : [],
      membershipTier: recipientType === 'membership_tier' ? membershipTier : undefined,
      createdBy: req.user._id,
    });

    await promotionalEmail.save();
    res.status(201).json(promotionalEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all promotional emails
router.get('/', isAdmin, async (req, res) => {
  try {
    const emails = await PromotionalEmail.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific promotional email
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const email = await PromotionalEmail.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('recipients', 'name email');
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a promotional email
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { subject, content, scheduledFor, recipientType, recipients, membershipTier } = req.body;
    
    const email = await PromotionalEmail.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.status === 'sent') {
      return res.status(400).json({ message: 'Cannot edit a sent email' });
    }

    email.subject = subject;
    email.content = content;
    email.scheduledFor = scheduledFor;
    email.recipientType = recipientType;
    email.recipients = recipientType === 'selected' ? recipients : [];
    email.membershipTier = recipientType === 'membership_tier' ? membershipTier : undefined;

    await email.save();
    res.json(email);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a promotional email
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const email = await PromotionalEmail.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    if (email.status === 'sent') {
      return res.status(400).json({ message: 'Cannot delete a sent email' });
    }

    await email.remove();
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a simple email validation function
function isValidEmail(email) {
  // Basic regex for email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send promotional email immediately
router.post('/:id/send', isAdmin, async (req, res) => {
  try {
    const email = await PromotionalEmail.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    let recipients = [];
    if (email.recipientType === 'all') {
      recipients = await User.find({}, 'email');
    } else if (email.recipientType === 'selected') {
      recipients = await User.find({ _id: { $in: email.recipients } }, 'email');
    } else if (email.recipientType === 'membership_tier') {
      recipients = await User.find({ membership_tier: email.membershipTier }, 'email');
    }

    // Configure email transporter (you'll need to set up your email service credentials)
    const transporter = nodemailer.createTransport({
      // Add your email service configuration here
      // Example for Gmail:
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send emails to all recipients
    const emailPromises = recipients
      .filter(recipient => isValidEmail(recipient.email))
      .map(recipient => {
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

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    email.status = 'failed';
    await email.save();
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 