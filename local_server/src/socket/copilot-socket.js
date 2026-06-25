let namespace = null;
export const copilotSocket = (socket) => {
  //클라이언트에서오는 요청

  socket.on("copilot-connected", () => {
    const { roomName } = socket.data.roomName;
  });

  //GROQ에서 응답 받은 걸로 오는
};

//GROQ로 부터 받은 해당 질문에 대한 INSIGHT 를 RETURN
export const sendCopilotInsightToHost = ({ hostId, insightFromGROQ }) => {
  if (!namespace) return;
  namespace.to(`copilot:${hostId}`).emit(`copilotInsight`, insightFromGROQ);
};
