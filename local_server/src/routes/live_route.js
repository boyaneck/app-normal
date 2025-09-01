import express from "express";
import { livekitWebhook } from "../live/live_duration.js";
import { getStartTime } from "../live/live_getStartTime.js";
const router = express.Router();

router.post("/live_getStartTime", getStartTime);
router.post(
  "/webhook",
  express.raw({ type: "application/webhook+json" }),
  livekitWebhook
);

export default router;
