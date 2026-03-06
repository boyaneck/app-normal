export const getTrendingStreams = (allStreams, limit = 20) => {
  if (allStreams.length === 0) return [];

  return allStreams
    .map((stream) => {
      const popularity = Math.log(stream.viewerCount + 1) / 5;
      const growth = Math.min(stream.viewerGrowth, 1);
      const trendingScore = popularity * 0.4 + growth * 0.6;

      const hoursLive =
        (Date.now() - new Date(stream.startedAt).getTime()) / (1000 * 3600);
      const penalty = Math.min(hoursLive * 0.02, 0.2);

      const finalScore = trendingScore - penalty;

      return { ...stream, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
};

/**
 * 홈 화면: 트렌딩 + 랜덤
 */
export const getHomeStreams = (allStreams, limit = 20) => {
  if (allStreams.length === 0) return [];
  if (allStreams.length <= limit) return allStreams;

  const trendingCount = Math.floor(limit * 0.6);
  const randomCount = Math.ceil(limit * 0.4);

  const trending = getTrendingStreams(allStreams, trendingCount);

  const remaining = allStreams
    .filter((s) => !trending.some((t) => t.id === s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, randomCount);

  return [...trending, ...remaining];
};
