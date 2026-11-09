import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";
import { detectViewerSpike } from "./viewer-spike-detector.js";

// 5분마다 현재 시청자 수를 시계열로 기록 (방송 후 시청자 추이 차트, 평균 시청자 계산용)
// live-webhook.js 안에 있던 것을 분리: finalizeLive, 서버 재시작 복구에서도 같이 쓰기 위해
const TIMESERIES_INTERVAL_MS = 5 * 60 * 1000;
const timeseriesIntervals = new Map();

export const startTimeseriesRecording = (roomName) => {
  if (timeseriesIntervals.has(roomName)) return;
  const keys = getRedisKeys(roomName);

  const intervalId = setInterval(async () => {
    try {
      const currentViewers = await redis_client.hLen(keys.VIEWERS);
      const timestamp = Date.now();

      await redis_client.zAdd(keys.TIMESERIES, {
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
  }, TIMESERIES_INTERVAL_MS);

  timeseriesIntervals.set(roomName, intervalId);
};

export const stopTimeseriesRecording = (roomName) => {
  const intervalId = timeseriesIntervals.get(roomName);
  if (intervalId) {
    clearInterval(intervalId);
    timeseriesIntervals.delete(roomName);
    console.log(`[Timeseries] ${roomName} 기록 중지`);
  }
};
