const PromotionalEmail = require('../Models/PromotionalEmail');
const User = require('../../Users/Models/User');
const { createTransporter } = require('../../../config/emailConfig');

class PromotionalEmailController {
  // Create a new promotional email
  static async create(req, res) {
    try {
      console.log('[PromotionalEmailController] Create called.');
      console.log('[PromotionalEmailController] req.user:', req.user);
      console.log('[PromotionalEmailController] req.body:', req.body);
      if (!req.user || !req.user.userId) {
        console.log('[PromotionalEmailController] Unauthorized: req.user missing or userId missing.');
        return res.status(401).json({ message: 'Unauthorized: Admin authentication required.' });
      }
      const { subject, content, scheduledFor, recipientType, recipients, membershipTier } = req.body;
      
      // Validate required fields
      if (!subject || !content || !scheduledFor || !recipientType) {
        console.log('[PromotionalEmailController] Missing required fields.');
        return res.status(400).json({ 
          message: 'Missing required fields: subject, content, scheduledFor, and recipientType are required' 
        });
      }

      // Validate scheduledFor is a future date
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate < new Date()) {
        console.log('[PromotionalEmailController] Scheduled date is not in the future.');
        return res.status(400).json({ 
          message: 'Scheduled date must be in the future' 
        });
      }

      // Validate recipientType specific requirements
      if (recipientType === 'selected' && (!recipients || !Array.isArray(recipients) || recipients.length === 0)) {
        console.log('[PromotionalEmailController] Selected recipients missing.');
        return res.status(400).json({ 
          message: 'Selected recipients are required when recipientType is "selected"' 
        });
      }

      if (recipientType === 'membership_tier' && !membershipTier) {
        console.log('[PromotionalEmailController] Membership tier missing.');
        return res.status(400).json({ 
          message: 'Membership tier is required when recipientType is "membership_tier"' 
        });
      }

      const promotionalEmail = new PromotionalEmail({
        subject,
        content,
        scheduledFor: scheduledDate,
        recipientType,
        recipients: recipientType === 'selected' ? recipients : [],
        membershipTier: recipientType === 'membership_tier' ? membershipTier : undefined,
        createdBy: req.user.userId,
        status: 'scheduled'
      });
      console.log('[PromotionalEmailController] Saving promotional email:', promotionalEmail);
      await promotionalEmail.save();
      console.log('[PromotionalEmailController] Promotional email saved successfully.');
      res.status(201).json(promotionalEmail);
    } catch (error) {
      console.error('[PromotionalEmailController] Error creating promotional email:', error);
      res.status(500).json({ 
        message: 'Error creating promotional email',
        error: error.message 
      });
    }
  }

  // Get all promotional emails
  static async getAll(req, res) {
    try {
      const emails = await PromotionalEmail.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      res.json(emails);
    } catch (error) {
      console.error('Error fetching promotional emails:', error);
      res.status(500).json({ 
        message: 'Error fetching promotional emails',
        error: error.message 
      });
    }
  }

  // Get a specific promotional email
  static async getById(req, res) {
    try {
      const email = await PromotionalEmail.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('recipients', 'name email');
      
      if (!email) {
        return res.status(404).json({ message: 'Email not found' });
      }
      res.json(email);
    } catch (error) {
      console.error('Error fetching promotional email:', error);
      res.status(500).json({ 
        message: 'Error fetching promotional email',
        error: error.message 
      });
    }
  }

  // Update a promotional email
  static async update(req, res) {
    try {
      const { subject, content, scheduledFor, recipientType, recipients, membershipTier } = req.body;
      
      // Validate required fields
      if (!subject || !content || !scheduledFor || !recipientType) {
        return res.status(400).json({ 
          message: 'Missing required fields: subject, content, scheduledFor, and recipientType are required' 
        });
      }

      const email = await PromotionalEmail.findById(req.params.id);
      if (!email) {
        return res.status(404).json({ message: 'Email not found' });
      }

      if (email.status === 'sent') {
        return res.status(400).json({ message: 'Cannot edit a sent email' });
      }

      // Validate scheduledFor is a future date
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate < new Date()) {
        return res.status(400).json({ 
          message: 'Scheduled date must be in the future' 
        });
      }

      // Validate recipientType specific requirements
      if (recipientType === 'selected' && (!recipients || !Array.isArray(recipients) || recipients.length === 0)) {
        return res.status(400).json({ 
          message: 'Selected recipients are required when recipientType is "selected"' 
        });
      }

      if (recipientType === 'membership_tier' && !membershipTier) {
        return res.status(400).json({ 
          message: 'Membership tier is required when recipientType is "membership_tier"' 
        });
      }

      email.subject = subject;
      email.content = content;
      email.scheduledFor = scheduledDate;
      email.recipientType = recipientType;
      email.recipients = recipientType === 'selected' ? recipients : [];
      email.membershipTier = recipientType === 'membership_tier' ? membershipTier : undefined;

      await email.save();
      res.json(email);
    } catch (error) {
      console.error('Error updating promotional email:', error);
      res.status(500).json({ 
        message: 'Error updating promotional email',
        error: error.message 
      });
    }
  }

  // Delete a promotional email
  static async delete(req, res) {
    try {
      const email = await PromotionalEmail.findById(req.params.id);
      if (!email) {
        return res.status(404).json({ message: 'Email not found' });
      }

      if (email.status === 'sent') {
        return res.status(400).json({ message: 'Cannot delete a sent email' });
      }

      await email.deleteOne();
      res.json({ message: 'Email deleted successfully' });
    } catch (error) {
      console.error('Error deleting promotional email:', error);
      res.status(500).json({ 
        message: 'Error deleting promotional email',
        error: error.message 
      });
    }
  }

  // Send promotional email immediately
  static async sendNow(req, res) {
    try {
      const email = await PromotionalEmail.findById(req.params.id);
      if (!email) {
        return res.status(404).json({ message: 'Email not found' });
      }

      await this.sendEmail(email);
      res.json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending promotional email:', error);
      res.status(500).json({ 
        message: 'Error sending promotional email',
        error: error.message 
      });
    }
  }

  // Internal method to send email
  static async sendEmail(email) {
    let transporter;
    try {
      transporter = createTransporter();
      
      let recipients = [];
      if (email.recipientType === 'all') {
        recipients = await User.find({}, 'email');
      } else if (email.recipientType === 'selected') {
        recipients = await User.find({ _id: { $in: email.recipients } }, 'email');
      } else if (email.recipientType === 'membership_tier') {
        recipients = await User.find({ membership_tier: email.membershipTier }, 'email');
      }

      if (recipients.length === 0) {
        email.status = 'failed';
        email.error = 'No recipients found';
        await email.save();
        return;
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
      email.sentAt = new Date();
      await email.save();
      
    } catch (error) {
      email.status = 'failed';
      email.error = error.message;
      await email.save();
      throw error;
    } finally {
      if (transporter) {
        transporter.close();
      }
    }
  }
}

module.exports = PromotionalEmailController; 