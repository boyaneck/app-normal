// loop.js — 방송당 주기적으로 도는 메인 루프 (의사 코드 수준)

import { decide } from "./decision.js";
import { getMetrics } from "./metric.js";
import { makeChatContext } from "../context/chat-context.js";
import { setupGROQIntention } from "../lib/setup-intention.js";
import { generateLine } from "../lib/generate-line.js";
import { sendCopilotInsightToHost } from "../../socket/copilot-socket.js";

export const observe = async (roomName) => {
  const metric = await getMetrics(roomName); // 감지
  const event = decide(roomName, metric); // 판단

  if (!event) return; // 침묵이 기본값

  // --- 행동 층: 트리거가 떴을 때만 채팅 분석 → 의도 결정 → GROQ 호출 → 호스트 전달 ---
  const chatContext = await makeChatContext(roomName);
  const intention = setupGROQIntention({ chat: chatContext });
  const line = await generateLine(intention, { chat: chatContext });

  sendCopilotInsightToHost({ hostID: roomName, insightFromGROQ: line });

  // 지금은 로그만 (라벨링용 — 나중에 ✅/❌ 달 데이터)
  console.log(`[INTERVENE] ${roomName}`, {
    metric: event.metric,
    z: event.z.toFixed(2),
    score: event.score.toFixed(2),
    value: event.value,
    at: new Date(metric.now).toISOString(),
  });
};

// 방송 중인 room마다 주기적으로 observe()를 돌리기 위한 스케줄러
const OBSERVE_INTERVAL_MS = 15 * 1000;
const copilotIntervals = new Map();

export const startCopilotLoop = (roomName) => {
  if (copilotIntervals.has(roomName)) return;

  const intervalId = setInterval(() => {
    observe(roomName).catch((err) =>
      console.error(`[Copilot] ${roomName} observe 오류:`, err.message),
    );
  }, OBSERVE_INTERVAL_MS);

  copilotIntervals.set(roomName, intervalId);
};

export const stopCopilotLoop = (roomName) => {
  const intervalId = copilotIntervals.get(roomName);
  if (intervalId) {
    clearInterval(intervalId);
    copilotIntervals.delete(roomName);
    console.log(`[Copilot] ${roomName} observe 루프 중지`);
  }
};
