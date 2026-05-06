import express from "express";
import { livekitWebhook } from "../live/live_duration.js";
import { liveParticipantWebhook } from "../live/live_participant.js";
import { getStartTime } from "../live/live_getStartTime.js";
import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";
import { liveWebhook } from "../live/live-webhook.js";
const router = express.Router();

// 테스트용: 강제 하이라이트 스파이크 생성
router.post("/test-spike", async (req, res) => {
  const { roomName } = req.body;
  if (!roomName) return res.status(400).json({ error: "roomName 필요" });

  const keys = getRedisKeys(roomName);
  const now = Date.now();

  await redis_client.zAdd(keys.HIGHLIGHTS, {
    score: now,
    value: JSON.stringify({ type: "viewer_surge", currentViewers: 99, avgViewers: 10, changeRate: 890, timestamp: now }),
  });

  console.log(`[TestSpike] ${roomName} 강제 하이라이트 삽입 완료`);
  res.json({ ok: true, timestamp: now });
});

router.post("/live_getStartTime", getStartTime);
router.post("/live_getIn");
router.post(
  "/webhook_participant",
  express.raw({ type: "application/webhook+json" }),
  liveParticipantWebhook,
);
router.get("/live-recommend", getRecommendLiveList);
router.get("/live-home", getHomeLiveList);
router.post("/live-analytics", getLiveAnalytics);
router.post(
  "/webhook_duration",
  express.raw({ type: "application/webhook+json" }),
  livekitWebhook,
);

// LiveKit 메인 웹훅 (ingress_started, room_finished, participant_joined 등)
router.post(
  "/webhook",
  express.raw({ type: "application/webhook+json" }),
  liveWebhook,
);

export default router;
