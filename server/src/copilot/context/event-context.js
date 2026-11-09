import { redis_client } from "../../config/redis.js";
import { getRedisKeys } from "../../live/redis-keys.js";

const RECENT_MS = 60 * 1000;

/**
 * 후원 급증 맥락: 최근 1분 후원자 닉네임과 금액
 * payment-service.js의 saveDonation이 keys.DONATION 리스트에 쌓아둔 값을 읽는다.
 */
export const makeDonationContext = async (roomName) => {
  const keys = getRedisKeys(roomName);
  const raw = await redis_client.lRange(keys.DONATION, -20, -1);
  const since = Date.now() - RECENT_MS;

  const recent = raw
    .map((r) => {
      try {
        return JSON.parse(r);
      } catch {
        return null;
      }
    })
    .filter((d) => d && d.timestamp >= since);

  if (recent.length === 0) return null;

  const totalAmount = recent.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const donors = [...new Set(recent.map((d) => d.buyerName || "익명"))];

  return { count: recent.length, totalAmount, donors };
};

/** 시청자 급증 맥락: 지금 시청자 수와 직전 추세 */
export const makeViewerContext = (event) => ({
  current: event.value,
  // 이벤트의 z, slope는 detector가 계산한 값
  surge: Number(event.z.toFixed(1)),
});
