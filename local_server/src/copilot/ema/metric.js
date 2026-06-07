import { redis_client } from "../../config/redis";
import { getRedisKeys } from "../../live/redis-keys";
import { createDetector } from "./detector";

const WINDOW_MS = 30 * 1000;

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
