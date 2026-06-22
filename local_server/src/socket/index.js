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

  const namespaceRoom = io.of("/room");

  namespaceRoom.on("connection", (socket) => {
    console.log("각 유저의 Socket 새 연결 🚀 ", socket.id);
    chatSocket(socket, namespaceRoom);
    copilotSocket(socket, namespaceRoom);

    socket.on("send_streaming_viewer_presence", () => {});
  });
  return io;
};
