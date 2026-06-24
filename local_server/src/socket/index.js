import { Server } from "socket.io";
import { chatSocket } from "./chat-socket.js";
import { liveSocket } from "./live-socket.js";
import { copilotSocket } from "./copilot-socket.js";
import { chatNamespace } from "./namespace/chat.js";
import { copilotNamespace } from "./namespace/copilot.js";
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  chatNamespace(io);
  copilotNamespace(io);

  //커밋 에러 테스트
  return io;
};
