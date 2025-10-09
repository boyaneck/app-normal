import express from "express";

export const router = express.Router();

router.post("/im_port", paymentController.handleWebhook);
