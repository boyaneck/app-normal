import { redis_client } from "../config/redis";

export const streamingSocket = (socket, namespace_room) => {
  socket.on("", ({ message_info }) => {
    const user_nickname = message_info?.user_nickname;
    console.log("메세지가 오고 있어요", message_info);
    socket.emit("receive_message", message_info);
  });
};
