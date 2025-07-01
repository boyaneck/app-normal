const express = require("express");
const paymentController = require("../controllers/payment.controller");

const router = express.Router();

router.post("/im_port", paymentController.handleWebhook);

module.exports = router;
