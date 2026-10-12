import { redis_client } from "../../config/redis.js";
import { getRedisKeys } from "../../live/redis-keys.js";
import { createDetector } from "./detector.js";

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

  const viewerCount = await redis_client.hLen(keys.VIEWERS);
  return {
    now,
    chat: { value: chatCount, ...detects.chat(chatCount) },
    donation: { value: donationCount, ...detects.donation(donationCount) },
    viewer: { value: viewerCount, ...detects.viewer(viewerCount) },
  };
};

// 1.delta가 그게 얼마나 튀었냐라는 거잖아 ,근데 z를 구하는게 delta/std 인데 std가 표준편차인데 왜 이걸 이렇게 하는거야 ?
// 2.정확히 표쥰편차에대해서 간단힌 설명해줘
// 3.1-alpha를 하는게 왜 감쇠하는거야 ? alpha는 지금 현재에 일어난 일을 과거보다 더 가중치를 두겠다라는거의 값이잖아 ,근데..
// 4.편차제곱의 지수이동 평균이란 말도 잘 햇갈리고, 지수이동이라는게 정확히 뭐지...
// 5.그래저 detetcs.chat하면 room에 있는 저 chat:createDetector가 실행되는데 이때 여기 createDetector 안에 (room) 이런식으로 변수가 없잖아
// 6.이 update가 이 변수들을 클로저로 참조하고 있다라는게 먼말임 ?
// 7.다시 저 describe에서 focusdata가 어떻게 쓰이는지 간단히좀 설명해줘
