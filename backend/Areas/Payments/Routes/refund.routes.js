const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth");
const { requestRefund } = require("../Controllers/refund.controller");

// POST /api/refunds/request
router.post("/request", auth, requestRefund);

module.exports = router; 