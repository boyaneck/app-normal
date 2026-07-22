let namespace = null;
export const copilotSocket = (socket, copilotRoom) => {
  const roomName = socket.data.roomName;
  console.log("copilot-socket 내에서 namespaceRoom 확인", copilotRoom);
  namespace = copilotRoom;
  socket.on("copilot-connected", () => {
    socket.join(`copilot:${roomName}`);
  });

  //GROQ에서 응답 받은 걸로 오는
};

export const sendCopilotInsightToHost = ({ hostID, insightFromGROQ }) => {
  console.log("ai 피드백을 보내기 위해서 namespace 체크하기", namespace);
  if (!namespace) return;
  namespace.to(`copilot:${hostID}`).emit(`copilotInsight`, insightFromGROQ);
};
//GROQ로 부터 받은 해당 질문에 대한 INSIGHT 를 RETURN
