import { redis_client } from "../config/redis";
import { getRedisKeys } from "../live/redis-keys";

const RECENT_MS = 60 * 1000;
const MIN_MSG_RECOGNIZED_LENGTH = 2;
const TOP_USERS = 3;
const TOP_KEYWORDS = 5;
const ORIGINAL_MSG_COUNT = 15;

const getChatList = async (roomName) => {
  const keys = getRedisKeys(roomName);
  const now = Date.now();

  const chatList = await redis_client.Zrange(
    keys.CHAT_TIMESERIES,
    now - RECENT_MS,
    now,
    { BY: "SCORE" },
  );
};
