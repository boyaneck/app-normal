import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";

const SPIKE_THRESHOLD = 0.3; // 30% 변화율 기준
const MIN_DATA_POINTS = 2; // 최소 2포인트(=10분) 이후 감지 시작
const SPIKE_COOLDOWN_MS = 5 * 60 * 1000; // 동일 타입 스파이크 5분 내 중복 방지

/**
 * 전체 방송 구간의 평균 시청자 대비 현재 시청자 변화율을 계산해
 * 30% 이상 변화 시 HIGHLIGHTS Sorted Set에 저장
 *
 * @param {string} roomName
 * @param {number} currentViewers - 현재 동시 시청자 수
 */
export const detectViewerSpike = async (roomName, currentViewers) => {
  const keys = getRedisKeys(roomName);

  // 1. 전체 시계열 조회 (방송 시작부터 현재까지)
  const timeseriesData = await redis_client.zRangeWithScores(
    keys.TIMESERIES,
    0,
    -1,
  );

  // 2. 워밍업 체크 — 데이터 포인트가 부족하면 감지 안 함
  if (timeseriesData.length < MIN_DATA_POINTS) {
    console.log(`ViewrSpike ${roomName}: 워밍업 중, 수집 데이터 부족)`);
    return;
  }

  // 3. 전체 구간 평균 시청자 계산
  const viewerCounts = timeseriesData.map((entry) => parseInt(entry.value, 10));
  const avgViewers =
    viewerCounts.reduce((sum, v) => sum + v, 0) / viewerCounts.length;

  if (avgViewers === 0) return;

  // 4. 변화율 계산
  // changeRate = (현재 - 평균) / 평균
  // 예) 평균 100명, 현재 140명 → changeRate = 0.4 (+40%)
  // 예) 평균 100명, 현재 65명  → changeRate = -0.35 (-35%)
  const changeRate = (currentViewers - avgViewers) / avgViewers;

  // 5. 임계값 미만이면 스킵
  if (Math.abs(changeRate) < SPIKE_THRESHOLD) return;

  const spikeType = changeRate > 0 ? "viewer_surge" : "viewer_drop";
  const now = Date.now();

  // 6. 쿨다운 체크 — 5분 내 동일 타입 스파이크가 이미 있으면 스킵
  const recentRaw = await redis_client.zRange(
    keys.HIGHLIGHTS,
    now - SPIKE_COOLDOWN_MS,
    now,
    { BY: "SCORE" },
  );

  const hasDuplicate = recentRaw.some((raw) => {
    try {
      return JSON.parse(raw).type === spikeType;
    } catch {
      return false;
    }
  });

  if (hasDuplicate) return;

  // 7. 하이라이트 저장
  const highlight = JSON.stringify({
    type: spikeType,
    currentViewers,
    avgViewers: Math.round(avgViewers),
    changeRate: Math.round(changeRate * 100), // % 단위 정수
    timestamp: now,
  });

  await redis_client.zAdd(keys.HIGHLIGHTS, {
    score: now,
    value: highlight,
  });

  console.log(
    `[SpikeDetector] ${roomName}: ${spikeType} | 현재 ${currentViewers}명 | 평균 ${Math.round(avgViewers)}명 | 변화율 ${Math.round(changeRate * 100)}%`,
  );
};
