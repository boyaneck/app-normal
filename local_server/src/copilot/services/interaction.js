// push-to-host.js
// 검증 통과한 멘트를 프론트에 전달. WebSocket 가정.
// 너 인프라가 SSE/다른 거면 이 함수만 바꾸면 됨.

// 너 프로젝트의 ws 인스턴스를 import (예시)
// import { io } from "../socket";

/**
 * @param {string} roomName
 * @param {object} payload  { text, intent, urgency, at }
 */
export const pushToHost = async (roomName, payload) => {
  try {
    // 실제 구현은 너 ws 인프라에 맞게
    // io.to(roomName).emit("copilot:line", payload);

    // 또는 SSE / Pub-Sub 등
    // 일단 구조만:
    console.log(`[pushToHost] ${roomName}`, payload);

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
