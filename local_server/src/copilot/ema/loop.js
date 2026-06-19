// loop.js — 방송당 주기적으로 도는 메인 루프 (의사 코드 수준)

import { decide } from "./decision.js";
import { getMetrics } from "./metric.js";
import { makeChatContext } from "../context/chat-context.js";
import { setupGROQIntention } from "../lib/setup-intention.js";
import { generateLine } from "../lib/generate-line.js";
// import { generateCopilotLine } from "./action.js"; // 다음 단계 (Groq)

export const observe = async (roomName) => {
  const metric = await getMetrics(roomName); // 감지
  const event = decide(roomName, metric); // 판단

  if (!event) return; // 침묵이 기본값

  // --- 여기서부터 행동 층 (다음 단계) ---
  // const line = await generateCopilotLine(event, metric);
  // pushToHost(roomName, line);
  const chatContext = await makeChatContext(roomName);
  const intention = setupGROQIntention({ chat: chatContext });
  const line = await generateLine(intention, { chat: chatContext });

  // 지금은 로그만 (라벨링용 — 나중에 ✅/❌ 달 데이터)
  console.log(`[INTERVENE] ${roomName}`, {
    metric: event.metric,
    z: event.z.toFixed(2),
    score: event.score.toFixed(2),
    value: event.value,
    at: new Date(metric.now).toISOString(),
  });
};
