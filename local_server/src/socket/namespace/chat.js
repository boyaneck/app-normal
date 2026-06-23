import { chatSocket } from "../chat-socket";

export const chatNamespace = (io) => {
  const chatRoom = io.of("/chat");

  chatRoom.on("connection", (socket) => {
    console.log("chat-copilot socke 연결 완료 !✅");
    chatSocket(socket, chatRoom);
  });
};
