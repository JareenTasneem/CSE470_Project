// backend/Areas/Payments/Routes/payment.routes.js
const express = require("express");
const router  = express.Router();
const auth    = require("../../../middlewares/auth");

const {
  createInstallmentPlan,
  getInstallmentPlan,
  payInstallment,

  /* invoice handlers */
  generateInstallmentInvoice,
  generateBookingInvoice,

  createFullPaymentSession,
  createInstallmentPaymentSession,
  confirmInstallmentPayment,
  confirmFullPayment,
} = require("../Controllers/payment.controller");

/* ──────────────────────────────────────────────
   INSTALLMENT PLAN
────────────────────────────────────────────── */
router.post("/create/:bookingId", auth, createInstallmentPlan);
router.get ("/plan/:bookingId",   auth, getInstallmentPlan);
router.post("/pay/:paymentId",    auth, payInstallment);

/* ──────────────────────────────────────────────
   INVOICE DOWNLOADS  ❱ now PUBLIC (no auth)
────────────────────────────────────────────── */
router.get("/invoice/installment/:paymentId", generateInstallmentInvoice);
router.get("/invoice/booking/:bookingId",     generateBookingInvoice);

/* ──────────────────────────────────────────────
   STRIPE SESSIONS & CONFIRMATIONS
────────────────────────────────────────────── */
router.post("/fullpayment/:bookingId",           auth, createFullPaymentSession);
router.post("/installment-payment/:paymentId",   auth, createInstallmentPaymentSession);
router.post("/confirm-installment-payment",      auth, confirmInstallmentPayment);
router.post("/confirm-full-payment/:bookingId",  auth, confirmFullPayment);

module.exports = router;
