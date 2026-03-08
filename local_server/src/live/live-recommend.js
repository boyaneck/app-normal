import { redis_client } from "../config/redis.js";

/**
 * 방송목록 전체를 가져오는 함수
 */
const getAllLiveList = async () => {
  const liveRooms = await redis_client.zRangeWithScores("live:rank", 0, -1, {
    REV: true,
  });
  const arr = [];
  for (const room of liveRooms) {
    const roomName = room.value;

    const [info, category] = await Promise.all([
      redis_client.hGetAll(`live:${roomName}:info`),
      redis_client.get(`live:${roomName}:category`),
    ]);

    arr.push({
      id: roomName,
      host: info.host || roomName,
      title: info.title || "무제",
      category: category || "기타",
      viewerCount: room.score,
      viewerGrowth: Math.random() * 0.5,
      startedAt: info.started_at
        ? new Date(parseInt(info.started_at)).toISOString()
        : new Date().toISOString(),
    });
  }
  return arr;
};

/**
 * 추천 알고리즘
 */
const algorithmRecommendations = (
  userPref,
  currentLive,
  allCandidates,
  limit = 10,
) => {
  return allCandidates
    .filter((s) => s.id !== currentLive.id)
    .map((candidate) => {
      const personalScore = userPref[candidate.category] || 0;
      const contextualScore =
        candidate.category === currentLive.category ? 1 : 0;
      const popularity = Math.log(candidate.viewerCount + 1) / 10;
      const growth = Math.min(candidate.viewerGrowth, 1);
      const trendingScore = popularity * 0.3 + growth * 0.7;
      const hoursLive =
        (Date.now() - new Date(candidate.startedAt).getTime()) / (1000 * 3600);
      const penalty = Math.min(hoursLive * 0.02, 0.1);
      const finalScore =
        personalScore * 0.4 +
        contextualScore * 0.3 +
        trendingScore * 0.3 -
        penalty;
      return { ...candidate, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
};

/**
 * 클라이언트 요청 처리
 */
export const getRecommendLiveList = async (req, res) => {
  try {
    const currentRoomId = req.query.room_id;
    const allLives = await getAllLiveList();

    const currentLive = allLives.find((s) => s.id === currentRoomId);
    if (!currentLive) {
      return res.json(allLives);
    }

    const recommended = algorithmRecommendations({}, currentLive, allLives);
    res.json(recommended);
  } catch (error) {
    console.error("getRecommendLiveList error:", error);
    res.status(500).json({ error: "failed" });
  }
};
