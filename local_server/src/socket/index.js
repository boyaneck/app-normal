import { Server } from "socket.io";
import { chatSocket } from "./chat_socket.js";
import { streamingSocket } from "./streaming_socket.js";
export const initialize_socket = (http_server) => {
  const io = new Server(http_server, {
    cors: {
      origin: "http://localhost:3000/", // 허용할 clear도메인
      methods: ["GET", "POST"], // 허용할 메서드
      allowedHeaders: ["my-custom-header"], // 허용할 헤더
    },
  });

  const namespace_room = io.of("/room");

  namespace_room.on("connection", (socket) => {
    chatSocket(socket, namespace_room);
    streamingSocket(socket, namespace_room);
    console.log("일단 연결은 완성 ");

    socket.on("send_streaming_viewer_presence", () => {});
  });
};
