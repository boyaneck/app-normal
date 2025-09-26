import { redis_client } from "../config/redis.js";

const redis_client_chat = redis_client;
export const chatSocket = (socket, namespace_room) => {
  socket.on("send_message", async ({ message_info }) => {
    try {
      const chat_num = message_info?.current_chat_room_number;
      const user_name = message_info?.user_nickname;
      const redis_chat_key = `chat_num:${chat_num}`;
      const redis_chat_ratio_key = `chat_num:${chat_num}:ratio`;
      console.log("메세지 정보 확인하기", message_info);
      if (chat_num) {
        const message_data = JSON.stringify(message_info);
        console.log("메세지 보내기", message_data);
        await redis_client_chat.lPush(redis_chat_key, message_data);
        await redis_client_chat.sAdd(redis_chat_ratio_key, "3");
        // await redis_client_chat.expire(redis_chat_key,60*60*24)
      }

      console.log("메세지 정보 확인하기", message_info);
      socket.emit("receive_message", message_info);
    } catch (error) {}
  });
};
