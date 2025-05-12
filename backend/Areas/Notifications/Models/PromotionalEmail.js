const mongoose = require('mongoose');

const promotionalEmailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'failed'],
      default: 'draft',
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    recipientType: {
      type: String,
      enum: ['all', 'selected', 'membership_tier'],
      required: true,
    },
    membershipTier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      required: function() {
        return this.recipientType === 'membership_tier';
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromotionalEmail', promotionalEmailSchema); 