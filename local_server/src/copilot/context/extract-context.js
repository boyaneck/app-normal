import { redis_client } from "../../config/redis";
import { getRedisKeys } from "../../live/redis-keys";

const RECENT_MS = 5 * 60 * 1000;
const METRIC_KOR = {
  donation: "후원",
  chat: "채팅",
  viewer: "시청자",
};

export const ss = (event) => {
  const metricName = METRIC_KOR[event.metric] ?? event.metric;
  const times = event.z.toFixed(1);
  const direction = event.slope > 0 ? "증가" : "감소";

  return {
    metric: event.metric,
    z: event.z,
    direction: event.slope,
  };

  //채팅 문맥 분석-원문에서 구조를 추출
  const makeChatContext = async (roomName) => {
    const kyes = getRedisKeys(roomName);
    const now = Date.now();

    const msgRawDatas = await redis_client.zRange(
      kyes.CHAT_TIMESERIES,
      now - RECENT_MS,
      now,
      { BY: "SCORE" },
    );

    const msgArr = msgRawDatas.map((msg) => {});

    const userCount = {};

    //해당 유저의 닉네임과 채팅 카운트를 순위를 매겨 1~3위의 유저를 골라냄
    for (const msg of msgRawDatas) {
      userCount[msg.nickName] = (userCount[msg.nickName] || 0) + 1;
    }
    const activeUsers = Object.entries(userCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nickName, count]) => ({ nickName, count }));
  };

  //채팅으로 온 이벤트 단순하게 해석하여 한국말로 변형
  const figureOutEvent = async (event) => {
    const metricName = METRIC_KOR[event.metric] ?? event.metric;
    const zScore = event.z.toFixed(2);
    const direction = event.slope > 0 ? "증가" : "감소";

    return {
      metric: metricName,
      z: zScore,
      direction,
      meaning: `${metricName}이 평소대비 ${zScore}배 강하게 ${direction}`,
    };
  };
};
