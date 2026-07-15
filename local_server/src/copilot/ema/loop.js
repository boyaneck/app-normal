import { decide, resetRoomDecision } from "./decision.js";
import { getMetrics, resetRoomMetrics } from "./metric.js";
import { makeChatContext } from "../context/chat-context.js";
import { setupGROQIntention } from "../lib/setup-intention.js";
import { generateLine } from "../lib/generate-line.js";
import { sendCopilotInsightToHost } from "../../socket/copilot-socket.js";

export const observe = async (roomName) => {
  const metric = await getMetrics(roomName); // 감지
  const event = decide(roomName, metric); // 판단

  console.log(
    `[Copilot][${roomName}] chat z=${metric.chat.z.toFixed(2)} ready=${metric.chat.ready} value=${metric.chat.value} | donation z=${metric.donation.z.toFixed(2)} ready=${metric.donation.ready} | viewer z=${metric.viewer.z.toFixed(2)} ready=${metric.viewer.ready} | event=${event ? event.metric : "none"}`,
  );

  if (!event) return; // 침묵이 기본값

  // --- 행동 층: 트리거가 떴을 때만 채팅 분석 → 의도 결정 → GROQ 호출 → 호스트 전달 ---
  const chatContext = await makeChatContext(roomName);
  console.log("chatContext 완료");
  const intention = setupGROQIntention({ chat: chatContext });
  console.log("setupGroqIntention 완료");
  if (!intention) return; // 채팅 컨텍스트가 없으면(방송 세션 통틀어 채팅 0건) 조용히 종료
  const line = await generateLine(intention);

  console.log(
    "여기까지가 groq으로 부터 채팅관련 스파이크 데이터를 처리하여 다시 서버에게 넘겨줌",
  );
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
// TODO: 디버깅용 2초 — 실제 데모/배포 전에 15 * 1000으로 되돌릴 것
const OBSERVE_INTERVAL_MS = 2 * 1000;
const copilotIntervals = new Map();
const runningRooms = new Set(); // 재진입 방지 — 이전 observe()가 아직 안 끝났으면 이번 틱은 건너뜀

export const startCopilotLoop = (roomName) => {
  if (copilotIntervals.has(roomName)) return;

  const intervalId = setInterval(() => {
    if (runningRooms.has(roomName)) return; // 이전 사이클 진행 중 — 겹쳐 실행 방지
    runningRooms.add(roomName);
    observe(roomName)
      .catch((err) =>
        console.error(`[Copilot] ${roomName} observe 오류:`, err.message),
      )
      .finally(() => runningRooms.delete(roomName));
  }, OBSERVE_INTERVAL_MS);

  copilotIntervals.set(roomName, intervalId);
};

export const stopCopilotLoop = (roomName) => {
  const intervalId = copilotIntervals.get(roomName);
  if (intervalId) {
    clearInterval(intervalId);
    copilotIntervals.delete(roomName);
    runningRooms.delete(roomName);
    resetRoomMetrics(roomName);
    resetRoomDecision(roomName);
    console.log(`[Copilot] ${roomName} observe 루프 중지`);
  }
};
