import { copilotSocket } from "../../socket/copilot-socket";

export const pushToHost = async (roomName, payload) => {
  try {
    return true;
  } catch (err) {
    console.error("[pushToHost] 전송 실패:", err.message);
    return false;
  }
};

/**
 * urgency 결정 헬퍼 — score 기반
 */
export const computeUrgency = (event) => {
  if (event.score >= 2.5) return "high";
  if (event.score >= 1.8) return "normal";
  return "low";
};
