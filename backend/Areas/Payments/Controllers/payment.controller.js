// backend/Areas/Payments/Controllers/payment.controller.js

const Payment = require("../Models/payment"); // relative import from /Models
const Booking = require("../../Bookings/Models/Booking");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

/**
 * Create (or return existing) a 3‑installment plan for a booking
 */
exports.createInstallmentPlan = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // If a plan already exists, return it
    const existing = await Payment.find({ booking: bookingId }).sort("installmentNumber");
    if (existing.length) {
      return res.json(existing);
    }

    // Guard: ensure we have a valid total_price
    if (typeof booking.total_price !== "number") {
      return res.status(400).json({ message: "Booking does not have a valid total_price" });
    }

    const perInstallment = parseFloat((booking.total_price / 3).toFixed(2));
    const start = booking.createdAt || new Date();
    const createdPlans = [];

    for (let i = 1; i <= 3; i++) {
      const plan = new Payment({
        payment_id: uuidv4(),
        invoiceId: `INV-${uuidv4().slice(0, 8).toUpperCase()}`, // Short readable invoice ID
        booking: bookingId,
        installmentNumber: i,
        amount: perInstallment,
        dueDate: new Date(
          start.getFullYear(),
          start.getMonth() + i - 1,
          start.getDate()
        ),
        status: "Unpaid",
      });

      await plan.save();
      createdPlans.push(plan);
    }

    return res.status(201).json(createdPlans);
  } catch (err) {
    console.error("Error in createInstallmentPlan:", err);
    return res.status(500).json({
      message: "Server error creating payment plan",
      error: err.message,
    });
  }
};

/**
 * Fetch the 3‑installment plan and statuses for a booking
 */
exports.getInstallmentPlan = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const plan = await Payment.find({ booking: bookingId }).sort("installmentNumber");
    return res.json(plan);
  } catch (err) {
    console.error("Error in getInstallmentPlan:", err);
    return res.status(500).json({ message: "Server error fetching payment plan", error: err.message });
  }
};

/**
 * Mark one installment as paid
 */
exports.payInstallment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Installment not found" });
    }
    if (payment.status === "Paid") {
      return res.status(400).json({ message: "Installment already paid" });
    }

    payment.status = "Paid";
    payment.paidAt = new Date();
    await payment.save();
    return res.json(payment);
  } catch (err) {
    console.error("Error in payInstallment:", err);
    return res.status(500).json({ message: "Server error processing payment", error: err.message });
  }
};

/**
 * Generate and return a PDF invoice for a paid installment
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("booking");
    if (!payment || payment.status !== "Paid") {
      return res.status(404).json({ message: "Invoice not available" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${payment.invoiceId}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc
      .fontSize(20)
      .text("Invoice", { align: "center" })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Invoice ID: ${payment.invoiceId}`)
      .text(`Date: ${payment.paidAt.toDateString()}`)
      .moveDown()
      .text(`Booking ID: ${payment.booking._id}`)
      .text(`Installment: ${payment.installmentNumber} of 3`)
      .text(`Amount Paid: $${payment.amount.toFixed(2)}`)
      .text(`Paid At: ${payment.paidAt.toLocaleString()}`);

    doc.end();
  } catch (err) {
    console.error("Error in generateInvoice:", err);
    return res.status(500).json({ message: "Server error generating invoice", error: err.message });
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Full Payment Session Controller
exports.createFullPaymentSession = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('tour_package hotelMeta custom_package');
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let price = 0;
    if (booking.custom_package) {
      const flights = booking.custom_package.flights || [];
      const hotels = booking.custom_package.hotels || [];
      const enterts = booking.custom_package.entertainments || [];
      price = 
        flights.reduce((s, f) => s + (f.price || 0), 0) +
        hotels.reduce((s, h) => s + (h.price_per_night || 0), 0) +
        enterts.reduce((s, e) => s + (e.price || 0), 0);
    } else {
      price = booking.total_price || 0;
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Booking ${bookingId}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: { bookingId: bookingId },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Stripe session:", err);
    return res.status(500).json({ message: "Server error creating payment session", error: err.message });
  }
};

exports.createInstallmentPaymentSession = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate('booking');

    if (!payment || payment.status === "Paid") {
      return res.status(404).json({ message: "Installment already paid or not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Installment ${payment.installmentNumber} for Booking ${payment.booking._id}`,
          },
          unit_amount: Math.round(payment.amount * 100), // Stripe expects cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: { paymentId: paymentId }, // Very important to track which installment
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating installment payment session:", err);
    return res.status(500).json({ message: "Server error creating installment payment session" });
  }
};
exports.confirmInstallmentPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;   // ✅ expects { paymentId } in body
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "Paid";  // ✅ forcibly mark it Paid
    payment.paidAt = new Date();
    await payment.save();

    return res.json({ message: "Payment marked as Paid", payment });
  } catch (err) {
    console.error("Error confirming payment:", err);
    return res.status(500).json({ message: "Server error confirming payment", error: err.message });
  }
};


exports.confirmFullPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "Confirmed") {
      booking.status = "Confirmed";
      await booking.save();
    }

    res.json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    console.error("Error confirming full payment:", error);
    res.status(500).json({ message: "Server error confirming payment", error: error.message });
  }
};