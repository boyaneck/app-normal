const { Server } = require("socket.io");
const chat_socket = require("./chat_socket");
const streaming_socket = require("./streaming_socket");

const initialize_socket = () => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000/", // 허용할 clear도메인
      methods: ["GET", "POST"], // 허용할 메서드
      allowedHeaders: ["my-custom-header"], // 허용할 헤더
    },
  });

  const chat_namespace = io.of("/chat");
  const streaming_namespace = io.of("/streaming");

  namespace_room.on("connection", (socket) => {
    chat_socket(socket, io, namespace_room);
    streaming_socket(socket, io, namespace_room);
    console.log("일단 연결은 완성 ");
    socket.on("send_message", ({ message_info }) => {
      socket.emit("receive_message", message_info);
    });
    socket.on("send_streaming_viewer_presence", () => {});
  });
};
module.exports = initialize_socket;
