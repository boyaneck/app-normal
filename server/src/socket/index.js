import { Server } from "socket.io";
import { chatNamespace } from "./namespace/chat.js";
import { copilotNamespace } from "./namespace/copilot.js";
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  chatNamespace(io);
  copilotNamespace(io);

  //커밋 에러 테스트
  return io;
};
