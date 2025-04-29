// backend/Areas/Payments/Routes/payment.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth");

const {
  createInstallmentPlan,
  getInstallmentPlan,
  payInstallment,
  generateInvoice,
  createFullPaymentSession,
  createInstallmentPaymentSession,
  confirmInstallmentPayment,
  confirmFullPayment,
} = require("../Controllers/payment.controller");

// initialize (or return) the 3‑payment plan for a booking
router.post("/create/:bookingId", auth, createInstallmentPlan);

// get the plan & statuses
router.get("/plan/:bookingId", auth, getInstallmentPlan);

// pay one installment
router.post("/pay/:paymentId", auth, payInstallment);

// download invoice PDF
router.get("/invoice/:paymentId", auth, generateInvoice);

router.post("/fullpayment/:bookingId", auth, createFullPaymentSession);

router.post("/installment-payment/:paymentId", auth, createInstallmentPaymentSession);

router.post("/confirm-installment-payment", auth, confirmInstallmentPayment);

router.post("/confirm-full-payment/:bookingId", auth, confirmFullPayment);

module.exports = router;
