import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { insertLiveStats } from "../api/live.js";
import { detectViewerSpike } from "./viewer-spike-detector.js";
import { startRecording, stopRecording, waitForEgressComplete } from "./egress-manager.js";
import { runClipPipeline } from "./clip-pipeline.js";
import { getRedisKeys } from "./redis-keys.js";

const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);

export { getRedisKeys } from "./redis-keys.js";

export const liveWebhook = async (req, res) => {
  let event;
  try {
    event = await receiver.receive(req.body, req.get("Authorization"));
    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook verification failed", err);
    return res.status(400).send("Invalid Webhook");
  }

  if (!event) return;

  let roomName = event.room?.name || event.ingressInfo?.roomName;

  if (!roomName) {
    console.log(`[Webhook] ${event.event} : roomName을 찾을 수 없음`);
    return;
  }

  const viewer = event.participant ? event.participant.identity : null;

  const keys = getRedisKeys(roomName);

  try {
    switch (event.event) {
      case "ingress_started": {
        const live_started_at = Date.now();
        await redis_client.hSetNX(
          keys.INFO,
          "started_at",
          live_started_at.toString(),
        );

        // 시간 및 날짜 저장
        const now = new Date();
        const kst_time = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const date = kst_time.toISOString().split("T")[0];
        const day_of_week = kst_time.toLocaleDateString("ko-KR", {
          weekday: "long",
        });
        await redis_client.hSet(keys.INFO, "today", `${date}/${day_of_week}`);

        // 카테고리 저장
        const category = event.room?.metadata?.category || "기타";
        await redis_client.set(keys.CATEGORY, category);

        // 랭킹보드 초기화
        await redis_client.zAdd(keys.VIEWER_RANK, {
          score: 0,
          value: roomName,
        });

        // 시계열 초기 데이터
        await redis_client.zAdd(keys.TIMESERIES, {
          score: Date.now(),
          value: "0",
        });

        // 5분마다 시계열 데이터 저장
        startTimeseriesRecording(roomName);

        // Egress 녹화 시작 (실패해도 방송 진행)
        try {
          const { egressId, fileName } = await startRecording(roomName);
          await redis_client.hSet(keys.EGRESS, {
            egressId,
            fileName,
          });
        } catch (egressErr) {
          console.error("[Egress] 녹화 시작 실패 (방송은 정상 진행):", egressErr.message);
        }

        break;
      }

      case "participant_joined": {
        if (!viewer) break;

        const viewerVisitCount = await redis_client.hIncrBy(
          keys.VIEWERS,
          viewer,
          1,
        );

        if (viewerVisitCount === 1) {
          const currentViewers = await redis_client.hLen(keys.VIEWERS);
          const peakViewersStr = await redis_client.hGet(
            keys.PEAK_VIEW,
            "peak_view",
          );
          await redis_client.zIncrBy(keys.VIEWER_RANK, 1, roomName);
          const peakViewers = peakViewersStr ? parseInt(peakViewersStr, 10) : 0;

          if (currentViewers > peakViewers) {
            await redis_client.hSet(
              keys.PEAK_VIEW,
              "peak_view",
              currentViewers.toString(),
            );
          }

          await redis_client.sAdd(keys.ALL_VISITORS, viewer);
        }

        // 시청 시작 시간 기록
        await redis_client.hSet(keys.AVG_RATE, viewer, Date.now().toString());

        break;
      }

      case "participant_left": {
        if (!viewer) break;

        const viewerLeftCount = await redis_client.hDel(keys.VIEWERS, viewer);

        if (viewerLeftCount > 0) {
          await redis_client.zIncrBy(keys.VIEWER_RANK, -1, roomName);

          const currentScore = await redis_client.zScore(
            keys.VIEWER_RANK,
            roomName,
          );
          if (currentScore < 0) {
            await redis_client.zAdd(keys.VIEWER_RANK, {
              score: 0,
              value: roomName,
            });
          }
        }

        const joinTimeStr = await redis_client.hGet(keys.AVG_RATE, viewer);
        if (joinTimeStr) {
          const durationSec = Math.round(
            (Date.now() - parseInt(joinTimeStr, 10)) / 1000,
          );
          if (durationSec >= 60) {
            await redis_client.sAdd(keys.STAY_MINUTE, viewer);
          }
          await redis_client.hDel(keys.AVG_RATE, viewer);
        }

        break;
      }

      case "ingress_ended": {
        stopTimeseriesRecording(roomName);

        // Egress 중지 요청 (파일 최종화 시작)
        const egressId = await redis_client.hGet(keys.EGRESS, "egressId");
        if (egressId) {
          stopRecording(egressId).catch((err) =>
            console.error("[Egress] 중지 실패:", err.message),
          );
        }

        break;
      }

      case "room_finished": {
        console.log("room_finished 이벤트 수신:", roomName);
        stopTimeseriesRecording(roomName);

        // Egress 중지 (ingress_ended에서 이미 했을 수 있지만 안전하게 재호출)
        const egressId = await redis_client.hGet(keys.EGRESS, "egressId");
        const recordingFilePath = await redis_client.hGet(keys.EGRESS, "fileName");
        const startedAtStr = await redis_client.hGet(keys.INFO, "started_at");

        if (egressId) {
          await stopRecording(egressId);
        }

        // 최대 시청자 수
        const peakViewersStr = await redis_client.hGet(
          keys.PEAK_VIEW,
          "peak_view",
        );
        const peakViewers = peakViewersStr ? parseInt(peakViewersStr, 10) : 0;

        // 방송 시작 시간
        const startISO = startedAtStr
          ? new Date(parseInt(startedAtStr, 10)).toISOString()
          : new Date().toISOString();
        const broadcastStartedAt = startedAtStr ? parseInt(startedAtStr, 10) : Date.now();

        // 누적 방문자 수
        const totalVisitors = await redis_client.sCard(keys.ALL_VISITORS);

        // 시청 지속률 (1분 이상 머문 사람 / 전체 방문자)
        const stayedViewers = await redis_client.sCard(keys.STAY_MINUTE);
        const retentionRate =
          totalVisitors > 0 ? (stayedViewers / totalVisitors).toFixed(2) : "0";

        // 채팅 전환율 = 1분이상 머문 사람 중 채팅을 친 사람 비율
        const chattersWhoStayed = await redis_client.sInter([
          keys.CHAT_UNIQUE_USERS,
          keys.STAY_MINUTE,
        ]);
        const intoChatRate =
          stayedViewers > 0
            ? (chattersWhoStayed.length / stayedViewers).toFixed(2)
            : "0";

        const category = await redis_client.get(keys.CATEGORY);
        const durationMin = startedAtStr
          ? Math.round((Date.now() - parseInt(startedAtStr, 10)) / 60000)
          : 0;

        // 통계 저장
        const saveSuccess = await insertLiveStats({
          roomName,
          peakViewers,
          startISO,
          totalVisitors,
          stayedViewers,
          retentionRate,
          intoChatRate,
          category,
          durationMin,
        });

        if (saveSuccess) {
          await redis_client.zRem(keys.VIEWER_RANK, roomName);

          const keysToDelete = [
            keys.VIEWERS,
            keys.PEAK_VIEW,
            keys.INFO,
            keys.AVG_RATE,
            keys.STAY_MINUTE,
            keys.ALL_VISITORS,
            keys.CATEGORY,
            keys.TIMESERIES,
            keys.DONATION,
            keys.DONATION_TOTAL_AMOUNT,
            keys.DONATION_COUNT,
            keys.DONATION_TIMESERIES,
            keys.CHAT_UNIQUE_USERS,
            keys.CHAT_TIMESERIES,
            keys.EGRESS,
            // keys.HIGHLIGHTS — 클립 파이프라인에서 읽고 나서 삭제
          ];

          for (const key of keysToDelete) {
            await redis_client.del(key);
          }
        } else {
          await redis_client.hSet(keys.INFO, "save_failed", "true");
          console.error("Supabase 저장 실패 — Redis 데이터 유지");
        }

        // 클립 파이프라인 — Egress 완전 업로드 후 비동기 실행
        if (egressId && recordingFilePath) {
          scheduleClipPipeline(roomName, egressId, recordingFilePath, broadcastStartedAt, keys);
        }

        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
};

/**
 * Egress 업로드 완료를 기다린 후 클립 파이프라인 실행
 * room_finished 이벤트 처리를 블로킹하지 않도록 완전히 비동기 분리
 */
const scheduleClipPipeline = (roomName, egressId, recordingFilePath, broadcastStartedAt, keys) => {
  (async () => {
    try {
      console.log(`[ClipPipeline] Egress 업로드 대기 중: ${egressId}`);
      const completed = await waitForEgressComplete(egressId);

      if (!completed) {
        console.warn(`[ClipPipeline] Egress 미완료 — 클립 파이프라인 스킵: ${roomName}`);
        return;
      }

      await runClipPipeline(roomName, recordingFilePath, broadcastStartedAt);

      // 파이프라인 완료 후 HIGHLIGHTS 삭제
      await redis_client.del(keys.HIGHLIGHTS);
    } catch (err) {
      console.error(`[ClipPipeline] 비동기 실행 오류: ${err.message}`);
    }
  })();
};

// 시계열 데이터 기록
const timeseriesIntervals = new Map();

const startTimeseriesRecording = (roomName) => {
  if (timeseriesIntervals.has(roomName)) return;
  const viewersKey = `live:${roomName}:viewers`;
  const timeseriesKey = `live:${roomName}:timeseries`;

  const intervalId = setInterval(
    async () => {
      try {
        const currentViewers = await redis_client.hLen(viewersKey);
        const timestamp = Date.now();

        await redis_client.zAdd(timeseriesKey, {
          score: timestamp,
          value: currentViewers.toString(),
        });

        await detectViewerSpike(roomName, currentViewers);

        console.log(
          `[Timeseries] ${roomName}: ${currentViewers}명 (${new Date(timestamp).toISOString()})`,
        );
      } catch (error) {
        console.error(`[Timeseries Error] ${roomName}:`, error);
      }
    },
    5 * 60 * 1000,
  );

  timeseriesIntervals.set(roomName, intervalId);
};

const stopTimeseriesRecording = (roomName) => {
  const intervalId = timeseriesIntervals.get(roomName);
  if (intervalId) {
    clearInterval(intervalId);
    timeseriesIntervals.delete(roomName);
    console.log(`[Timeseries] ${roomName} 기록 중지`);
  }
};

// ViewerGrowth 계산
export const getViewerGrowth = async (roomName) => {
  const timeseriesKey = `live:${roomName}:timeseries`;
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  const recentData = await redis_client.zRangeByScoreWithScores(
    timeseriesKey,
    fiveMinutesAgo,
    now,
  );

  if (recentData.length < 2) {
    return 0;
  }

  const oldestViewers = parseInt(recentData[0].value, 10);
  const newestViewers = parseInt(recentData[recentData.length - 1].value, 10);

  if (oldestViewers === 0) {
    return newestViewers > 0 ? 1 : 0;
  }

  const growth = (newestViewers - oldestViewers) / oldestViewers;
  return Math.max(0, Math.min(1, growth));
};
