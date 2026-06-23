import { Server } from "socket.io";
import { chatSocket } from "./chat-socket.js";
import { liveSocket } from "./live-socket.js";
import { copilotSocket } from "./copilot-socket.js";
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  ChatNamespace(io);
  CopilotNamespace(io);

  //커밋 에러 테스트
  return io;
};
