export const copilotSocket = (socket, namespace_room) => {
  //클라이언트에서오는 요청

  let namespace = null;
  namespace = namespace_room;

  socket.on("copilot-connected", ({ hostId, roomName }) => {
    socket.join(`copilot:${hostId}`);
    console.log(`copilot:${hostId} 입장`);
  });

  //GROQ에서 응답 받은 걸로 오는
};

//GROQ로 부터 받은 해당 질문에 대한 INSIGHT 를 RETURN
export const sendCopilotInsightToHost = ({ hostId, insightFromGROQ }) => {
  if (!namespace) return;
  namespace.to(`copilot:${hostId}`).emit(`copilotInsight`, insightFromGROQ);
};
