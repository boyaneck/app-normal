import express from "express";
import { livekitWebhook } from "../live/live_duration.js";
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/webhook+json" }),
  livekitWebhook
);

export default router;
