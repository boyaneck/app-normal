import { redis_client } from "../config/redis.js";
import { insertLiveStats } from "../api/live.js";
import { getRedisKeys } from "./redis-keys.js";
import { LIVE_STATUS, setLiveStatus } from "./live-status.js";
import { stopTimeseriesRecording } from "./timeseries.js";
import { stopCopilotLoop } from "../copilot/loop.js";
import { generateLiveReport } from "./live-report.js";

const FINALIZE_LOCK_SEC = 60;

/**
 * 방송 종료 처리를 한 곳에 모은 함수
 *
 * 부르는 곳이 세 군데다:
 *  1) 호스트가 웹에서 "방송 종료" 버튼   → POST /live/end
 *  2) 호스트가 OBS 송출을 직접 끔        → 웹훅 ingress_ended
 *  3) 방이 비어서 닫힘 (안전망)          → 웹훅 room_finished
 * 셋 중 무엇이 먼저 오든, Redis 잠금(SET NX) 덕분에 실제 정리는 딱 한 번만 실행된다.
 *
 * @returns {{ result: "finalized" | "skipped" | "nothing" | "failed", stats?: object }}
 */
export const finalizeLive = async (roomName, { reason = "unknown" } = {}) => {
  const keys = getRedisKeys(roomName);
  const lockKey = `live:${roomName}:finalize_lock`;

  const locked = await redis_client.set(lockKey, reason, {
    NX: true,
    EX: FINALIZE_LOCK_SEC,
  });
  if (!locked) {
    console.log(`[Finalize] ${roomName} 이미 정리 중이거나 정리됨 → 건너뜀 (${reason})`);
    return { result: "skipped" };
  }

  // 루프는 어떤 경우든 먼저 멈춘다
  stopTimeseriesRecording(roomName);
  stopCopilotLoop(roomName);

  const startedAtStr = await redis_client.hGet(keys.INFO, "started_at");
  if (!startedAtStr) {
    // OBS 연결 전에 종료를 누른 경우(waiting) 등: 계산할 방송 데이터가 없다
    await setLiveStatus(roomName, LIVE_STATUS.READY);
    console.log(`[Finalize] ${roomName} 방송 데이터 없음 → ready 로 되돌림 (${reason})`);
    return { result: "nothing" };
  }

  await setLiveStatus(roomName, LIVE_STATUS.ENDING);
  console.log(`[Finalize] ${roomName} 정리 시작 (${reason})`);

  try {
    const stats = await collectLiveStats(roomName, startedAtStr);
    const saved = await insertLiveStats(stats);

    if (!saved) {
      await redis_client.hSet(keys.INFO, "save_failed", "true");
      await setLiveStatus(roomName, LIVE_STATUS.ENDED);
      // 잠금을 풀어서, 나중에 room_finished 등으로 다시 시도할 수 있게 한다
      await redis_client.del(lockKey);
      console.error("[Finalize] Supabase 저장 실패 — Redis 데이터 유지");
      return { result: "failed" };
    }

    await clearLiveRedis(roomName);
    await setLiveStatus(roomName, LIVE_STATUS.ENDED);

    // AI 리포트는 기다리지 않는다 → 종료 응답이 LLM 속도에 묶이지 않음
    generateLiveReport(saved).catch((err) =>
      console.error(`[Finalize] ${roomName} AI 리포트 생성 실패:`, err.message),
    );

    return { result: "finalized", stats: saved };
  } catch (error) {
    console.error(`[Finalize] ${roomName} 정리 중 오류:`, error);
    await redis_client.del(lockKey);
    return { result: "failed" };
  }
};

/** Redis에 쌓인 방송 데이터를 live_stats 한 줄로 계산 (기존 room_finished 로직 그대로) */
const collectLiveStats = async (roomName, startedAtStr) => {
  const keys = getRedisKeys(roomName);
  const startedAt = parseInt(startedAtStr, 10);

  const peakViewersStr = await redis_client.hGet(keys.PEAK_VIEW, "peak_view");
  const peakViewers = peakViewersStr ? parseInt(peakViewersStr, 10) : 0;

  const totalVisitors = await redis_client.sCard(keys.ALL_VISITORS);

  // 시청 지속률 (1분 이상 머문 사람 / 전체 방문자)
  const stayedViewers = await redis_client.sCard(keys.STAY_MINUTE);
  const retentionRate =
    totalVisitors > 0 ? (stayedViewers / totalVisitors).toFixed(2) : "0";

  // 채팅 전환율 = 1분 이상 머문 사람 중 채팅을 친 사람 비율
  const chattersWhoStayed = await redis_client.sInter([
    keys.CHAT_UNIQUE_USERS,
    keys.STAY_MINUTE,
  ]);
  const intoChatRate =
    stayedViewers > 0 ? (chattersWhoStayed.length / stayedViewers).toFixed(2) : "0";

  const category = await redis_client.get(keys.CATEGORY);
  const durationMin = Math.round((Date.now() - startedAt) / 60000);

  // 후원 통계
  const fundStr = await redis_client.get(keys.DONATION_TOTAL_AMOUNT);
  const donationCountStr = await redis_client.get(keys.DONATION_COUNT);
  const donationUniqueUsers = await redis_client.sCard(keys.DONATION_UNIQUE_USERS);

  // 시계열 (차트용)
  const viewerTimeseries = await redis_client.zRangeWithScores(keys.TIMESERIES, 0, -1);
  const donationTimeseries = await redis_client.zRangeWithScores(
    keys.DONATION_TIMESERIES,
    0,
    -1,
  );

  const avgViewer =
    viewerTimeseries.length > 0
      ? Math.round(
          viewerTimeseries.reduce((sum, e) => sum + parseInt(e.value, 10), 0) /
            viewerTimeseries.length,
        )
      : 0;

  return {
    roomName,
    peakViewers,
    startISO: new Date(startedAt).toISOString(),
    totalVisitors,
    stayedViewers,
    retentionRate,
    intoChatRate,
    category,
    durationMin,
    fund: fundStr ? parseInt(fundStr, 10) : 0,
    donationCount: donationCountStr ? parseInt(donationCountStr, 10) : 0,
    donationUniqueUsers,
    avgViewer,
    viewerTimeseries,
    donationTimeseries,
  };
};

const clearLiveRedis = async (roomName) => {
  const keys = getRedisKeys(roomName);
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
    keys.DONATION_UNIQUE_USERS,
    keys.CHAT_UNIQUE_USERS,
    keys.CHAT_TIMESERIES,
    keys.HIGHLIGHTS,
    // 채팅 히스토리도 비운다: 남겨두면 다음 방송의 코파일럿이 지난 방송 채팅을 분석하게 됨
    keys.MSG,
  ];
  await redis_client.del(keysToDelete);
};
