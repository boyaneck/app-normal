/**
 * 트렌딩 점수 계산
 */
const calculateTrending = (allLives, limit = 12) => {
  if (allLives.length === 0) return [];

  return allLives
    .map((live) => {
      const popularity = Math.log(live.viewerCount + 1) / 5;
      const growth = Math.min(live.viewerGrowth, 1);
      const trendingScore = popularity * 0.4 + growth * 0.6;

      const hoursLive =
        (Date.now() - new Date(live.startedAt).getTime()) / (1000 * 3600);
      const penalty = Math.min(hoursLive * 0.02, 0.2);

      const finalScore = trendingScore - penalty;
      return { ...live, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
};

/**
 * 홈 화면용 — 트렌딩 60% + 랜덤 40%
 */
const calculateHomeLives = (allLives, limit = 20) => {
  if (allLives.length === 0) return [];
  if (allLives.length <= limit) return allLives;

  const trendingCount = Math.floor(limit * 0.6);
  const randomCount = Math.ceil(limit * 0.4);

  const trending = calculateTrending(allLives, trendingCount);

  const remaining = allLives
    .filter((s) => !trending.some((t) => t.id === s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, randomCount);

  return [...trending, ...remaining];
};

/**
 * 클라이언트 요청 처리
 */
export const getHomeLiveList = async (req, res) => {
  try {
    const allLives = await getAllLiveList();
    const homeLives = calculateHomeLives(allLives);
    res.json(homeLives);
  } catch (error) {
    console.error("getHomeLiveList error:", error);
    res.status(500).json({ error: "failed" });
  }
};
