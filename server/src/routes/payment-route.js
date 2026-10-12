import express from "express";
import { paymentWebhook, handleVerify, handlePrepare } from "../payment/payment-webhook.js";

const paymentRouter = express.Router();

// PortOne 서명 검증에는 원본 바디(raw body)가 그대로 필요하므로 JSON 파싱 전에 raw로 받는다
paymentRouter.post("/webhook", express.raw({ type: "*/*" }), paymentWebhook);
paymentRouter.post("/prepare", express.json(), handlePrepare);
paymentRouter.post("/verify", express.json(), handleVerify);

export default paymentRouter;
