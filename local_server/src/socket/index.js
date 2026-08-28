import { Server } from "socket.io";
import { chatNamespace } from "./namespace/chat.js";
import { copilotNamespace } from "./namespace/copilot.js";
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  });

  chatNamespace(io);
  copilotNamespace(io);
};
