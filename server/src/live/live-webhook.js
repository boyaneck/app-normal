import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";
import { startCopilotLoop } from "../copilot/loop.js";
import { startTimeseriesRecording } from "./timeseries.js";
import { finalizeLive } from "./finalize-live.js";
import { LIVE_STATUS, getLiveInfo, setLiveStatus } from "./live-status.js";

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

  const identity = event.participant ? event.participant.identity : null;
  // 시청자 통계에서 제외: OBS(Ingress) 참가자(identity = roomName)와 호스트 모니터링 페이지(HOST-*)
  // 예전에는 이 둘도 시청자로 세어져서 시청자 수/방문자 수가 실제보다 많게 기록됐다.
  const isNotViewer = identity === roomName || identity?.startsWith("HOST-");
  const viewer = identity && !isNotViewer ? identity : null;

  const keys = getRedisKeys(roomName);

  try {
    switch (event.event) {
      case "ingress_started": {
        console.log("ingress_Started가 시작되었요!");
        const live_started_at = Date.now();

        // 새 방송 시작: 이전 방송의 종료 잠금이 남아 있으면 풀어준다
        await redis_client.del(`live:${roomName}:finalize_lock`);

        // 방송 상태를 live로 → 홈 목록에 노출됨
        await setLiveStatus(roomName, LIVE_STATUS.LIVE, {
          started_at: new Date(live_started_at).toISOString(),
        });

        // 추천/목록 API가 Redis INFO의 title을 읽으므로 설정 페이지에서 저장한 제목을 넣어둔다
        const liveInfo = await getLiveInfo(roomName);
        if (liveInfo?.title) {
          await redis_client.hSet(keys.INFO, "title", liveInfo.title);
        }
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

        // 실시간 AI 코파일럿 루프 시작 (15초 주기 관찰)
        startCopilotLoop(roomName);

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
        // OBS 송출을 끈 순간. "방송 종료"라는 의미에 가장 정확히 맞는 이벤트라 여기서 정리한다.
        await finalizeLive(roomName, { reason: "ingress_ended" });
        break;
      }

      case "room_finished": {
        // 방이 비어서 닫힘. 위에서 이미 정리됐다면 잠금 때문에 건너뛴다 (안전망 역할)
        console.log("room_finished 이벤트 수신:", roomName);
        await finalizeLive(roomName, { reason: "room_finished" });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
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
