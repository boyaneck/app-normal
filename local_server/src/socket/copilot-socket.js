let namespace = null;

// 서버 부팅 시점(copilotNamespace 등록 시)에 바로 호출됨 —
// 클라이언트 접속을 기다리지 않아도 namespace가 항상 세팅돼있게 함
export const setCopilotNamespace = (ns) => {
  namespace = ns;
};

export const copilotSocket = (socket, copilotRoom) => {
  const roomName = socket.data.roomName;
  console.log("코파일럿 룸네임 확인", roomName);

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
