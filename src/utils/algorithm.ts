export interface Stream {
  id: string;
  category: string;
  tags: string[];
  viewerCount: number;
  viewerGrowth: number;
  startedAt: string;
  metadata: {
    energy: number;
  };
}

export interface UserPreference {
  [category: string]: number;
}

/**
 * 2. 메인 추천 함수
 */
export const getRecommendations = (
  userPref: UserPreference,
  currentStream: Stream,
  allCandidates: Stream[],
  limit: number = 10,
): Stream[] => {
  return allCandidates
    .filter((s) => s.id !== currentStream.id) // 현재 방송 제외
    .map((candidate) => {
      // 1. 개인화 점수 (40%): 유저가 과거에 이 카테고리를 좋아했나?
      const personalScore = userPref[candidate.category] || 0;

      // 2. 맥락 점수 (30%): 지금 보는 방송과 같은 카테고리인가?
      // 태그 대신 카테고리 일치 여부만 확인 (일치하면 1점, 아니면 0점)
      const contextualScore =
        candidate.category === currentStream.category ? 1 : 0;

      // 3. 트렌드 점수 (30%): 시청자 수 + 유입 증가율
      const popularity = Math.log(candidate.viewerCount + 1) / 10;
      const growth = Math.min(candidate.viewerGrowth, 1);
      const trendingScore = popularity * 0.3 + growth * 0.7;

      // 4. 시간 패널티= 오래된 방송일 수록 시청자가 접할 수 있는기회가 많으니 약간의 패널티를 줌
      const hoursLive =
        (Date.now() - new Date(candidate.startedAt).getTime()) / (1000 * 3600);
      const penalty = Math.min(hoursLive * 0.02, 0.1);

      // 최종 가중치 합산
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

export const getTrendingStreams = (
  allStreams: Stream[],
  limit: number = 20,
): Stream[] => {
  if (allStreams.length === 0) return [];

  return allStreams
    .map((stream) => {
      const popularity = Math.log(stream.viewerCount + 1) / 5;
      const growth = Math.min(stream.viewerGrowth, 1);
      const trendingScore = popularity * 0.4 + growth * 0.6;

      const hoursLive =
        (Date.now() - new Date(stream.startedAt).getTime()) / (1000 * 3600);
      const penalty = Math.min(hoursLive * 0.02, 0.2);
      5;

      const finalScore = trendingScore - penalty;

      return { ...stream, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
};

/**
 * 홈 화면: 트렌딩 + 랜덤
 */
export const getHomeStreams = (
  allStreams: Stream[],
  limit: number = 20,
): Stream[] => {
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
