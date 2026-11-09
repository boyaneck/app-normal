import { saveFeedback } from "../copilot/deliver/insight-store.js";

let namespace = null;

export const copilotSocket = (socket, copilotRoom) => {
  // roomName은 copilot-host-auth에서 "LiveKit 호스트 토큰 안의 방 이름"으로 정해진다
  const roomName = socket.data.roomName;
  namespace = copilotRoom;

  socket.on("copilot-connected", () => {
    socket.join(`copilot:${roomName}`);
  });

  // 호스트가 코파일럿 멘트에 👍/👎를 눌렀을 때
  socket.on("copilot-feedback", async ({ insightId, feedback } = {}) => {
    if (!insightId) return;
    await saveFeedback({ roomName, insightId, feedback });
  });
};

/**
 * 코파일럿 멘트를 호스트에게 보낸다
 * @param insight { id: 기록 id (피드백용, 기록 실패 시 null), line: 멘트 }
 */
export const sendCopilotInsightToHost = ({ hostID, insight }) => {
  if (!namespace) return;
  namespace.to(`copilot:${hostID}`).emit("copilotInsight", insight);
};
