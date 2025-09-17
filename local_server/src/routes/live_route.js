import express from "express";
import { livekitWebhook } from "../live/live_duration.js";
import { liveParticipantWebhook } from "../live/live_participant.js";
import { getStartTime } from "../live/live_getStartTime.js";
const router = express.Router();

router.post("/live_getStartTime", getStartTime);
router.post("/live_getIn");
router.post(
  "/webhook_participant",
  express.raw({ type: "application/webhook+json" }),
  liveParticipantWebhook
);
router.post(
  "/webhook_duration",
  express.raw({ type: "application/webhook+json" }),
  livekitWebhook
);

export default router;
