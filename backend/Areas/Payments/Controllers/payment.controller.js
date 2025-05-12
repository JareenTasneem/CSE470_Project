// backend/Areas/Payments/Controllers/payment.controller.js
/* eslint-disable consistent-return */
const Payment  = require("../Models/Payment");
const Booking  = require("../../Bookings/Models/Booking");
const User = require("../../Users/Models/User");
const { v4: uuidv4 } = require("uuid");
const stripe   = require("stripe")(process.env.STRIPE_SECRET_KEY);
const loyaltyController = require("../../LoyaltyTransactions/Controllers/loyalty.controller");

/* 🆕 pull in the PDF builder helper */
const { buildInvoice } = require("../Services/InvoiceService");

/* ───────────────────────────────────────────────────────────
   INSTALLMENT PLAN LOGIC  (unchanged)
──────────────────────────────────────────────────────────── */
exports.createInstallmentPlan = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const existing = await Payment.find({ booking: bookingId }).sort("installmentNumber");
    if (existing.length) return res.json(existing);

    if (typeof booking.total_price !== "number")
      return res.status(400).json({ message: "Booking does not have a valid total_price" });

    // Calculate discounted price based on user's loyalty tier
    const discountedPrice = await calculateDiscountedPrice(booking.user, booking.total_price);
    const perInstallment = parseFloat((discountedPrice / 3).toFixed(2));
    const start = booking.createdAt || new Date();
    const createdPlans = [];

    for (let i = 1; i <= 3; i++) {
      const plan = new Payment({
        payment_id: uuidv4(),
        invoiceId: `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
        booking: bookingId,
        installmentNumber: i,
        amount: perInstallment,
        dueDate: new Date(start.getFullYear(), start.getMonth() + i - 1, start.getDate()),
        status: "Unpaid",
        original_amount: booking.total_price / 3,
        discount_amount: (booking.total_price - discountedPrice) / 3
      });
      await plan.save();
      createdPlans.push(plan);
    }
    res.status(201).json(createdPlans);
  } catch (err) {
    console.error("createInstallmentPlan:", err);
    res.status(500).json({ message: "Server error creating payment plan", error: err.message });
  }
};

exports.getInstallmentPlan = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const plan = await Payment.find({ booking: bookingId }).sort("installmentNumber");
    res.json(plan);
  } catch (err) {
    console.error("getInstallmentPlan:", err);
    res.status(500).json({ message: "Server error fetching payment plan", error: err.message });
  }
};

exports.payInstallment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment)  return res.status(404).json({ message: "Installment not found" });
    if (payment.status === "Paid")
      return res.status(400).json({ message: "Installment already paid" });

    payment.status = "Paid";
    payment.paidAt = new Date();
    await payment.save();
    res.json(payment);
  } catch (err) {
    console.error("payInstallment:", err);
    res.status(500).json({ message: "Server error processing payment", error: err.message });
  }
};

/* ───────────────────────────────────────────────────────────
   🆕  INVOICE ENDPOINTS
──────────────────────────────────────────────────────────── */
/* single PAID installment */
exports.generateInstallmentInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment || payment.status !== "Paid")
      return res.status(404).json({ message: "Invoice not available" });

    const doc = buildInvoice({
      invoiceId: payment.invoiceId,
      date:     payment.paidAt || new Date(),
      booking:  payment.booking,
      amount:   payment.amount,
      note:     `Installment ${payment.installmentNumber} of 3`,
    });

    res.setHeader("Content-Type",        "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${payment.invoiceId}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("generateInstallmentInvoice:", err);
    res.status(500).json({ message: "Server error generating invoice" });
  }
};

/* full booking (must be Confirmed) */
exports.generateBookingInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== "Confirmed")
      return res.status(404).json({ message: "Invoice not available" });

    let amount = booking.total_price || 0;
    if (booking.custom_package) {
      const flights = booking.custom_package?.flights || [];
      const hotels  = booking.custom_package?.hotels  || [];
      const enterts = booking.custom_package?.entertainments || [];
      amount =
        flights.reduce((s, f) => s + (f.price || 0), 0) +
        hotels.reduce((s, h) => s + (h.price_per_night || 0), 0) +
        enterts.reduce((s, e) => s + (e.price || 0), 0);
    }

    const fakeInvoiceId = `INV-${bookingId.slice(-6).toUpperCase()}`;
    const doc = buildInvoice({
      invoiceId: fakeInvoiceId,
      date:     new Date(),
      booking,
      amount,
      note:     "Full Booking Payment",
    });

    res.setHeader("Content-Type",        "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${fakeInvoiceId}.pdf`);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("generateBookingInvoice:", err);
    res.status(500).json({ message: "Server error generating invoice" });
  }
};

/* ───────────────────────────────────────────────────────────
   STRIPE CHECKOUT  (unchanged)
──────────────────────────────────────────────────────────── */
exports.createFullPaymentSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("tour_package hotelMeta custom_package");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    let price = 0;
    if (booking.custom_package) {
      const f = booking.custom_package.flights || [];
      const h = booking.custom_package.hotels  || [];
      const e = booking.custom_package.entertainments || [];
      price =
        f.reduce((s, x) => s + (x.price || 0), 0) +
        h.reduce((s, x) => s + (x.price_per_night || 0), 0) +
        e.reduce((s, x) => s + (x.price || 0), 0);
    } else {
      price = booking.total_price || 0;
    }
    if (price <= 0) return res.status(400).json({ message: "Invalid price" });

    // Calculate discounted price based on user's loyalty tier
    const discountedPrice = await calculateDiscountedPrice(booking.user, price);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { 
            name: `Booking ${bookingId}`,
            description: `Original price: $${price.toFixed(2)} - Discount: ${(price - discountedPrice).toFixed(2)}`
          },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url:  `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: { bookingId },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("createFullPaymentSession:", err);
    res.status(500).json({ message: "Server error creating payment session", error: err.message });
  }
};

exports.createInstallmentPaymentSession = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment || payment.status === "Paid")
      return res.status(404).json({ message: "Installment already paid or not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Installment ${payment.installmentNumber} for Booking ${payment.booking._id}` },
          unit_amount: Math.round(payment.amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url:  `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: { paymentId },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("createInstallmentPaymentSession:", err);
    res.status(500).json({ message: "Server error creating installment payment session" });
  }
};

exports.confirmInstallmentPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = "Paid";
    payment.paidAt = new Date();
    await payment.save();

    // Check if all installments are paid
    const allPayments = await Payment.find({ booking: payment.booking._id });
    const allPaid = allPayments.every(p => p.status === "Paid");

    // If all installments are paid, confirm the booking and add points
    if (allPaid && payment.booking.status !== "Confirmed") {
      payment.booking.status = "Confirmed";
      await payment.booking.save();

      // Add loyalty points for the confirmed booking
      try {
        await loyaltyController.addPointsForBooking(payment.booking._id);
      } catch (error) {
        console.error("Error adding loyalty points:", error);
        // Don't fail the payment confirmation if points addition fails
      }
    }

    res.json({ message: "Payment marked as Paid", payment });
  } catch (err) {
    console.error("confirmInstallmentPayment:", err);
    res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
};

exports.confirmFullPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only add points if the booking is being confirmed for the first time
    if (booking.status !== "Confirmed") {
      booking.status = "Confirmed";
      await booking.save();

      // Add loyalty points for the confirmed booking
      try {
        await loyaltyController.addPointsForBooking(bookingId);
        console.log(`Added loyalty points for booking ${bookingId}`);
      } catch (error) {
        console.error("Error adding loyalty points:", error);
        // Don't fail the payment confirmation if points addition fails
      }
    }
    res.json({ message: "Booking confirmed successfully", booking });
  } catch (err) {
    console.error("confirmFullPayment:", err);
    res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
};

// Calculate discounted price based on user's loyalty tier
const calculateDiscountedPrice = async (userId, originalPrice) => {
  try {
    const user = await User.findById(userId);
    if (!user) return originalPrice;

    const discountPercentage = user.discount_percentage;
    const discountAmount = (originalPrice * discountPercentage) / 100;
    return originalPrice - discountAmount;
  } catch (error) {
    console.error("Error calculating discounted price:", error);
    return originalPrice;
  }
};
