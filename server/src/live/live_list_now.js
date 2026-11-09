import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "./redis-keys.js";

// 예전에는 "LIVE_VIEWER_RANK" 키를 읽었는데, 웹훅은 "live:rank"에 저장해서 항상 빈 목록이었다.
// 키 이름은 redis-keys.js 한 곳에서만 가져온다.
const LIVE_VIEWER_RANK = getRedisKeys().VIEWER_RANK;

export const liveListNow = async (req, res) => {
  try {
    // 메인 배너에 올라갈, 현재 시청자가 가장 많은 7개 방송
    const viewer_top7 = await redis_client.zRangeWithScores(LIVE_VIEWER_RANK, 0, 6, {
      REV: true,
    });

    return res.status(200).json(viewer_top7);
  } catch (error) {
    console.error("Redis 에러 발생:", error);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};
