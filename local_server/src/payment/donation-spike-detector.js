import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";

const WINDOW_MS = 60 * 1000;              // 1분 슬라이딩 윈도우
const MIN_PREV_WINDOWS = 3;              // 최소 3분치 이전 데이터 후 감지 시작
const SPIKE_MULTIPLIER = 3;              // 평균의 3배 초과 시 스파이크
const COLD_START_THRESHOLD = 50_000;     // 이전 데이터 없을 때 5만원 이상이면 스파이크
const SPIKE_COOLDOWN_MS = 5 * 60 * 1000; // 5분 내 중복 저장 방지

/**
 * 1분 슬라이딩 윈도우 내 후원 합계를 이전 윈도우 평균과 비교해 스파이크 감지
 *
 * @param {string} roomName
 * @param {number} currentAmount - 방금 들어온 후원 금액
 */
export const detectDonationSpike = async (roomName, currentAmount) => {
  const keys = getRedisKeys(roomName);
  const now = Date.now();

  // 1. 현재 1분 윈도우 합계
  const windowStart = now - WINDOW_MS;
  const currentWindowRaw = await redis_client.zRange(
    keys.DONATION_TIMESERIES,
    windowStart,
    now,
    { BY: "SCORE" },
  );

  const currentWindowSum = currentWindowRaw.reduce((sum, raw) => {
    try {
      return sum + JSON.parse(raw).amount;
    } catch {
      return sum;
    }
  }, 0);

  // 2. 이전 N분 데이터로 분당 평균 계산
  const historyStart = now - (MIN_PREV_WINDOWS + 1) * WINDOW_MS;
  const historyRaw = await redis_client.zRange(
    keys.DONATION_TIMESERIES,
    historyStart,
    windowStart,
    { BY: "SCORE" },
  );

  let avgPerWindow = 0;
  const hasPrevData = historyRaw.length > 0;

  if (hasPrevData) {
    const historySum = historyRaw.reduce((sum, raw) => {
      try {
        return sum + JSON.parse(raw).amount;
      } catch {
        return sum;
      }
    }, 0);
    avgPerWindow = historySum / MIN_PREV_WINDOWS;
  }

  // 3. 스파이크 판단
  // 이전 데이터 없음 → cold start threshold 기준
  // 이전 데이터 있음 → 평균의 SPIKE_MULTIPLIER배 초과
  const isSpike = hasPrevData
    ? currentWindowSum >= avgPerWindow * SPIKE_MULTIPLIER
    : currentWindowSum >= COLD_START_THRESHOLD;

  if (!isSpike) return;

  // 4. 쿨다운 체크 — 5분 내 동일 타입 중복 방지
  const recentRaw = await redis_client.zRange(
    keys.HIGHLIGHTS,
    now - SPIKE_COOLDOWN_MS,
    now,
    { BY: "SCORE" },
  );

  const hasDuplicate = recentRaw.some((raw) => {
    try {
      return JSON.parse(raw).type === "donation_spike";
    } catch {
      return false;
    }
  });

  if (hasDuplicate) return;

  // 5. 하이라이트 저장
  const highlight = JSON.stringify({
    type: "donation_spike",
    currentWindowSum,
    avgPerWindow: Math.round(avgPerWindow),
    multiplier: avgPerWindow > 0
      ? Math.round((currentWindowSum / avgPerWindow) * 10) / 10
      : null,
    timestamp: now,
  });

  await redis_client.zAdd(keys.HIGHLIGHTS, { score: now, value: highlight });

  console.log(
    `[DonationSpike] ${roomName}: ${currentWindowSum.toLocaleString()}원 | 평균 ${Math.round(avgPerWindow).toLocaleString()}원의 ${avgPerWindow > 0 ? Math.round(currentWindowSum / avgPerWindow) : "∞"}배`,
  );
};
