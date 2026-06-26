let namespace = null;
export const copilotSocket = (socket, copilotRoom) => {
  namespace = copilotRoom;
  socket.on("copilot-connected", () => {
    socket.join(`copilot:${roomName}`);
  });

  //GROQ에서 응답 받은 걸로 오는
};

export const sendCopilotInsightToHost = ({ hostId, insightFromGROQ }) => {
  if (!namespace) return;
  namespace.to(`copilot:${hostId}`).emit(`copilotInsight`, insightFromGROQ);
};
//GROQ로 부터 받은 해당 질문에 대한 INSIGHT 를 RETURN
