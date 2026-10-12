import { chatSocket } from "../chat-socket.js";

export const chatNamespace = (io) => {
  const chatRoom = io.of("/chat");

  chatRoom.on("connection", (socket) => {
    chatSocket(socket, chatRoom);
  });
};
