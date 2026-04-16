import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";

const WINDOW_MS = 30 * 1000;              // 30초 슬라이딩 윈도우
const MIN_PREV_WINDOWS = 3;              // 최소 3윈도우(=1.5분) 이후 감지 시작
const SPIKE_MULTIPLIER = 2.5;            // 평균의 2.5배 초과 시 스파이크
const COLD_START_THRESHOLD = 20;         // 이전 데이터 없을 때 30초 내 20개 이상
const SPIKE_COOLDOWN_MS = 3 * 60 * 1000; // 3분 내 동일 타입 중복 방지

/**
 * 30초 슬라이딩 윈도우 내 메시지 수를 이전 윈도우 평균과 비교해 스파이크 감지
 * 채팅 전환율 스파이크 = 단위 시간 내 메시지 수가 평균 대비 폭발적으로 증가한 구간
 *
 * @param {string} roomName
 */
export const detectChatSpike = async (roomName) => {
  const keys = getRedisKeys(roomName);
  const now = Date.now();

  // 1. 현재 30초 윈도우 메시지 수
  const windowStart = now - WINDOW_MS;
  const currentCount = await redis_client.zCount(
    keys.CHAT_TIMESERIES,
    windowStart,
    now,
  );

  // 2. 이전 MIN_PREV_WINDOWS개 윈도우 각각의 메시지 수 수집
  const prevCounts = [];
  for (let i = 1; i <= MIN_PREV_WINDOWS; i++) {
    const wStart = now - (i + 1) * WINDOW_MS;
    const wEnd = now - i * WINDOW_MS;
    const count = await redis_client.zCount(keys.CHAT_TIMESERIES, wStart, wEnd);
    prevCounts.push(count);
  }

  const hasPrevData = prevCounts.some((c) => c > 0);
  const avgPerWindow = hasPrevData
    ? prevCounts.reduce((s, c) => s + c, 0) / prevCounts.length
    : 0;

  // 3. 스파이크 판단
  const isSpike = hasPrevData
    ? currentCount >= avgPerWindow * SPIKE_MULTIPLIER
    : currentCount >= COLD_START_THRESHOLD;

  if (!isSpike) return;

  // 4. 쿨다운 체크 — 3분 내 동일 타입 중복 방지
  const recentRaw = await redis_client.zRange(
    keys.HIGHLIGHTS,
    now - SPIKE_COOLDOWN_MS,
    now,
    { BY: "SCORE" },
  );

  const hasDuplicate = recentRaw.some((raw) => {
    try {
      return JSON.parse(raw).type === "chat_spike";
    } catch {
      return false;
    }
  });

  if (hasDuplicate) return;

  // 5. 하이라이트 저장
  const highlight = JSON.stringify({
    type: "chat_spike",
    currentCount,
    avgPerWindow: Math.round(avgPerWindow),
    multiplier:
      avgPerWindow > 0
        ? Math.round((currentCount / avgPerWindow) * 10) / 10
        : null,
    timestamp: now,
  });

  await redis_client.zAdd(keys.HIGHLIGHTS, { score: now, value: highlight });

  console.log(
    `[ChatSpike] ${roomName}: ${currentCount}개/30s | 평균 ${Math.round(avgPerWindow)}개의 ${avgPerWindow > 0 ? Math.round(currentCount / avgPerWindow) : "∞"}배`,
  );
};
