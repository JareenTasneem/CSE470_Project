const express = require('express');
const router = express.Router();
const ReviewController = require('../Controllers/ReviewController');
const auth = require('../../../middlewares/auth');

// Get items that user can review
router.get('/reviewable-items', auth, ReviewController.getReviewableItems);

// Submit a review
router.post('/submit', auth, ReviewController.submitReview);

// Get reviews for an item
router.get('/item/:item_id/:item_type', ReviewController.getItemReviews);

// Mark a review as helpful
router.post('/helpful/:review_id', auth, ReviewController.markHelpful);

// Get all reviews for the logged-in user
router.get('/my-reviews', auth, ReviewController.getMyReviews);

module.exports = router; 