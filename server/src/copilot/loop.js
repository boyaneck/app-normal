import { COPILOT_CONFIG } from "./config.js";
import { getMetrics, resetRoomMetrics } from "./sense/metric.js";
import { decide, resetRoomDecision } from "./decide/decision.js";
import { makeChatContext } from "./context/chat-context.js";
import { makeDonationContext, makeViewerContext } from "./context/event-context.js";
import { setupGROQIntention } from "./act/setup-intention.js";
import { generateLine } from "./act/generate-line.js";
import { getRecentLines, pushLine, resetHistory } from "./act/history.js";
import { saveInsight } from "./deliver/insight-store.js";
import { sendCopilotInsightToHost } from "../socket/copilot-socket.js";

/**
 * 코파일럿 한 사이클
 *   [감지] sense/   → Redis에서 최근 채팅·후원·시청자 수 + EMA z-score
 *   [판단] decide/  → 임계값·쿨다운·점수로 "지금 개입할 가치가 있나"
 *   [맥락] context/ → 사건 종류에 맞는 데이터 정리
 *   [행동] act/     → 의도 결정 → LLM 한 문장 생성 (직전 멘트와 겹치면 침묵)
 *   [전달] deliver/ → 기록(피드백용 id) + 호스트에게 소켓 push
 */
export const observe = async (roomName) => {
  const metric = await getMetrics(roomName);
  const event = decide(roomName, metric);

  if (!event) return; // 침묵이 기본값

  const intention = setupGROQIntention({
    event,
    chat: event.metric === "chat" ? await makeChatContext(roomName) : null,
    donation: event.metric === "donation" ? await makeDonationContext(roomName) : null,
    viewer: event.metric === "viewer" ? makeViewerContext(event) : null,
  });
  if (!intention) return; // 말할 거리가 없으면 LLM을 부르지 않는다

  const line = await generateLine(intention, getRecentLines(roomName));
  if (!line) return; // LLM이 "말할 필요 없음(SKIP)"으로 판단

  pushLine(roomName, line);
  const insightId = await saveInsight({ roomName, event, intention, line });
  sendCopilotInsightToHost({ hostID: roomName, insight: { id: insightId, line } });

  console.log(`[INTERVENE] ${roomName}`, {
    metric: event.metric,
    z: event.z.toFixed(2),
    score: event.score.toFixed(2),
    value: event.value,
    line,
  });
};

// 방송 중인 room마다 주기적으로 observe()를 돌리는 스케줄러
const copilotIntervals = new Map();
const runningRooms = new Set(); // 재진입 방지 — 이전 observe()가 아직 안 끝났으면 이번 틱은 건너뜀

export const startCopilotLoop = (roomName) => {
  if (copilotIntervals.has(roomName)) return;

  const intervalId = setInterval(() => {
    if (runningRooms.has(roomName)) return;
    runningRooms.add(roomName);
    observe(roomName)
      .catch((err) => console.error(`[Copilot] ${roomName} observe 오류:`, err.message))
      .finally(() => runningRooms.delete(roomName));
  }, COPILOT_CONFIG.OBSERVE_INTERVAL_MS);

  copilotIntervals.set(roomName, intervalId);
  console.log(
    `[Copilot] ${roomName} observe 루프 시작 (${COPILOT_CONFIG.OBSERVE_INTERVAL_MS / 1000}초 주기)`,
  );
};

export const stopCopilotLoop = (roomName) => {
  const intervalId = copilotIntervals.get(roomName);
  if (intervalId) {
    clearInterval(intervalId);
    copilotIntervals.delete(roomName);
    runningRooms.delete(roomName);
    console.log(`[Copilot] ${roomName} observe 루프 중지`);
  }
  // 다음 방송이 이전 방송의 기준선/쿨다운/멘트 기록을 이어받지 않도록 정리
  resetRoomMetrics(roomName);
  resetRoomDecision(roomName);
  resetHistory(roomName);
};
