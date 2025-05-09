// Areas/Reviews/Controllers/ReviewController.js
const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;   // shortcut
const Review   = require('../Models/Review');
const Booking  = require('../../Bookings/Models/Booking');
const { v4: uuidv4 } = require('uuid');

/* ───────── helpers ───────── */
const getUserId = (req) => req.user?.userId || req.user?._id;

const getItemDisplayName = (review) => {
  if (!review.item) return 'Unknown item';
  switch (review.item_type) {
    case 'TourPackage':   return review.item.package_title;
    case 'Hotel':         return review.item.hotel_name || review.item.name;
    case 'Flight':        return `${review.item.airline_name} (${review.item.from} → ${review.item.to})`;
    case 'Entertainment': return review.item.entertainmentName;
    default:              return review.item.name || 'Item';
  }
};

/* ───────── controller ───────── */
const ReviewController = {
  /* 1. List reviewable items */
  async getReviewableItems(req, res) {
    try {
      const userId   = getUserId(req);
      const bookings = await Booking.find({ user: userId, status: 'Confirmed' })
        .populate('tour_package hotel flight');

      if (!bookings.length)
        return res.status(404).json({ message: 'No confirmed bookings found.' });

      const items = bookings.flatMap((b) => [
        b.tour_package && { type: 'TourPackage', item: b.tour_package, booking: b._id },
        b.hotel        && { type: 'Hotel',       item: b.hotel,        booking: b._id },
        b.flight       && { type: 'Flight',      item: b.flight,       booking: b._id },
      ].filter(Boolean));

      if (!items.length)
        return res.status(404).json({ message: 'You have already reviewed all items.' });

      res.json(items);
    } catch (err) {
      console.error('getReviewableItems →', err);
      res.status(500).json({ message: 'Failed to fetch items.' });
    }
  },

  /* 2. Submit review */
  async submitReview(req, res) {
    try {
      const { booking_id, item_id, item_type, rating, title, comment } = req.body;
      const userId = getUserId(req);

      const bookingObjId = new ObjectId(booking_id);
      const itemObjId    = new ObjectId(item_id);

      const booking = await Booking.findOne({
        _id:   bookingObjId,
        user:  userId,
      });
      if (!booking)
        return res.status(404).json({ message: 'Booking not eligible for review.' });

      const dup = await Review.findOne({
        user:    userId,
        booking: bookingObjId,
        item:    itemObjId,
      });
      if (dup)
        return res.status(400).json({ message: 'Already reviewed this item for this booking.' });

      const review = await Review.create({
        review_id: uuidv4(),
        user:      userId,
        booking:   bookingObjId,
        item:      itemObjId,
        item_type,
        rating:    Number(rating),
        title,
        comment,
      });

      res.status(201).json({ message: 'Review submitted!', review });
    } catch (err) {
      console.error('submitReview →', err);
      res.status(500).json({ message: 'Failed to submit review.' });
    }
  },

  /* 3. Item reviews */
  async getItemReviews(req, res) {
    try {
      const { item_id, item_type } = req.params;
      const reviews = await Review.find({ item: item_id, item_type })
        .populate('user', 'name')
        .sort({ createdAt: -1 });

      if (!reviews.length)
        return res.status(404).json({ message: 'No reviews yet.' });

      res.json(reviews);
    } catch (err) {
      console.error('getItemReviews →', err);
      res.status(500).json({ message: 'Failed to fetch reviews.' });
    }
  },

  /* 4. Mark helpful */
  async markHelpful(req, res) {
    try {
      const review = await Review.findById(req.params.review_id);
      if (!review) return res.status(404).json({ message: 'Review not found.' });

      review.helpful_votes += 1;
      await review.save();
      res.json({ message: 'Marked helpful!', review });
    } catch (err) {
      console.error('markHelpful →', err);
      res.status(500).json({ message: 'Failed to mark helpful.' });
    }
  },

  /* 5. My reviews */
  async getMyReviews(req, res) {
    try {
      const userId  = getUserId(req);
      const reviews = await Review.find({ user: userId })
        .populate({ path: 'item', strictPopulate: false })
        .sort({ createdAt: -1 });

      res.json(
        reviews.map((r) => ({
          ...r._doc,
          itemName:  getItemDisplayName(r) || r.item_type,
          bookingId: r.booking.toString(),
        }))
      );
    } catch (err) {
      console.error('getMyReviews →', err);
      res.status(500).json({ message: 'Failed to fetch your reviews.' });
    }
  },
};

module.exports = ReviewController;
