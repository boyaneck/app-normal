import { redis_client } from "../config/redis";

const redis_client_chat = redis_client;
export const chatSocket = (socket, namespace_room) => {
  socket.on("send_message", async ({ message_info }) => {
    const chat_num = message_info?.current_chat_room_number;
    const user_name = message_info?.user_nickname;
    const redis_chat_key = `chat_num:${chat_num}`;
    if (user_name) {
      await redis_client_chat.sAdd(redis_chat_key, user_name);
    }

    console.log("메세지 정보 확인하기", message_info);
    socket.emit("receive_message", message_info);
  });
};
