const paymentService = require("../services/payment.service");
import logger from "../utils/logger";
export const handleWebhook = async (req, res, next) => {
  try {
    await paymentService.processPaymentWebhook(req.body);
    res.status(200).send("Webhook received successfully");
  } catch (error) {
    logger.error("Error processing webhook:", error);
    next(error);
  }
};
