import { redis_client } from "../../config/redis";
import { getRedisKeys } from "../../live/redis-keys";
import { createDetector } from "./detector";

// TODO: 데모용 2초 — loop.js의 OBSERVE_INTERVAL_MS랑 반드시 같은 값으로 유지할 것
// (둘이 다르면 겹치는/비는 구간이 생겨서 EMA 신호가 다시 희석/누락됨)
const WINDOW_MS = 2 * 1000;

const rooms = new Map();

const getDetector = (roomName) => {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, {
      chat: createDetector(),
      donation: createDetector(),
      viewer: createDetector({ alpha: 0.2 }),
    });
  }
  return rooms.get(roomName);
};

// 방송 종료 시 호출 — 다음 방송이 이전 방송의 EMA 기준선을 이어받지 않도록 정리
export const resetRoomMetrics = (roomName) => {
  rooms.delete(roomName);
};

export const getMetrics = async (roomName) => {
  const keys = getRedisKeys(roomName);
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const detects = getDetector(roomName);

  const chatCount = await redis_client.zCount(
    keys.CHAT_TIMESERIES,
    windowStart,
    now,
  );
  const donationCount = await redis_client.zCount(
    keys.DONATION_TIMESERIES,
    windowStart,
    now,
  );

  //?여기 부분은 생각해야함
  const viewerRaw = await redis_client.get(keys.VIEWER_RANK);
  const viewerCount = Number(viewerRaw) || 0;
  return {
    now,
    chat: { value: chatCount, ...detects.chat(chatCount) },
    donation: { value: donationCount, ...detects.donation(donationCount) },
    viewer: { value: viewerCount, ...detects.viewer(viewerCount) },
  };
};
