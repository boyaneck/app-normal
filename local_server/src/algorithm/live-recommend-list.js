/**
 * 메인 추천 함수
 */
export const getRecommendations = (
  userPref,
  currentStream,
  allCandidates,
  limit = 10,
) => {
  return allCandidates
    .filter((s) => s.id !== currentStream.id)
    .map((candidate) => {
      const personalScore = userPref[candidate.category] || 0;

      const contextualScore =
        candidate.category === currentStream.category ? 1 : 0;

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
