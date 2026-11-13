import { WebhookReceiver, TrackType } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";
import { startCopilotLoop } from "../copilot/loop.js";
import { startTimeseriesRecording } from "./timeseries.js";
import { finalizeLive } from "./finalize-live.js";
import { LIVE_STATUS, getLiveInfo, setLiveStatus } from "./live-status.js";
import { isLiveSimulationEnabled, startLiveSimulation } from "./live-simulator.js";

const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);

export { getRedisKeys } from "./redis-keys.js";

const HOST_GONE_GRACE_MS = 20 * 1000;
const hostGoneKey = (roomName) => `live:${roomName}:host_gone`;

/**
 * 방송 시작 처리 (OBS ingress_started, 브라우저 track_published 공통)
 * 이미 live면 아무것도 안 한다 → 같은 웹훅이 두 번 오거나, 잠깐 끊겼다 다시 송출해도 방송이 새로 시작되지 않음
 */
const startLive = async (roomName, { source, category }) => {
  const current = await getLiveInfo(roomName);
  if (current?.status === LIVE_STATUS.LIVE) return;

  console.log(`[Live] ${roomName} 방송 시작 (${source})`);
  const keys = getRedisKeys(roomName);
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

  // 카테고리, 송출 방식 저장 (browser면 호스트 퇴장 시 자동 종료 대상)
  await redis_client.set(keys.CATEGORY, category || "기타");
  await redis_client.hSet(keys.INFO, "source", source);

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

  // [테스트 전용] SIMULATE_LIVE=true면 가짜 시청자/채팅/후원을 시간 압축으로 발생시킨다
  if (isLiveSimulationEnabled()) {
    startLiveSimulation(roomName).catch((err) =>
      console.error(`[Simulate] ${roomName} 시작 실패:`, err.message),
    );
  }
};

/**
 * 브라우저 방송 호스트가 방을 나갔을 때 (탭 닫기, 네트워크 끊김)
 * 바로 끝내지 않고 20초 기다린다 → 그 안에 다시 송출하면(track_published) 예약이 취소된다.
 * OBS 방송은 호스트가 모니터링 페이지만 닫아도 송출은 계속되므로 대상이 아니다.
 *
 * ⚠️ 타이머가 서버 메모리에 있어서, 20초 안에 서버가 재시작되면 종료가 누락될 수 있다.
 *    (다음 단계: 주기적 대조 작업으로 보완)
 */
const scheduleBrowserLiveEnd = async (roomName) => {
  const source = await redis_client.hGet(getRedisKeys(roomName).INFO, "source");
  if (source !== "browser") return;

  const token = Date.now().toString();
  await redis_client.set(hostGoneKey(roomName), token, { EX: 120 });
  console.log(`[Live] ${roomName} 호스트 퇴장 → ${HOST_GONE_GRACE_MS / 1000}초 후 종료 예정`);

  setTimeout(async () => {
    try {
      // 그 사이 다시 송출했으면 키가 지워졌거나 다른 값으로 바뀌어 있다
      if ((await redis_client.get(hostGoneKey(roomName))) !== token) return;
      await redis_client.del(hostGoneKey(roomName));
      await finalizeLive(roomName, { reason: "host_left" });
    } catch (error) {
      console.error(`[Live] ${roomName} 자동 종료 실패:`, error);
    }
  }, HOST_GONE_GRACE_MS);
};

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
  const isHost = !!identity?.startsWith("HOST-");

  const keys = getRedisKeys(roomName);

  try {
    switch (event.event) {
      case "ingress_started": {
        // OBS 송출 시작
        await startLive(roomName, { source: "obs", category: event.room?.metadata?.category });
        break;
      }

      case "track_published": {
        // 브라우저 송출 시작: 호스트(HOST-*)가 영상 트랙(카메라/화면 공유)을 올렸을 때
        if (!isHost || event.track?.type !== TrackType.VIDEO) break;
        await redis_client.del(hostGoneKey(roomName)); // 잠깐 끊겼다 다시 올린 경우: 종료 예약 취소
        await startLive(roomName, { source: "browser", category: event.room?.metadata?.category });
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
        if (isHost) {
          await scheduleBrowserLiveEnd(roomName);
          break;
        }
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
