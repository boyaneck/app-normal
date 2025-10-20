import { redis_client } from "../config/redis.js";

export const streamingSocket = (socket, namespace_room) => {
  socket.on("", ({ message_info }) => {
    const host_id = message_info?.current_host_id;
    const msg_date = message_info?.date;
    const user_nickname = message_info?.user_nickname;
    const room_num = message_info?.current_chat_room_number;
    const chat_info = {
      user_nickname,
      msg_date,
      room_num,
      host_id,
    };

    const redisWork = async () => {
      try {
        console.log("트라이");
        await redis_client.sAdd(`${host_id}:room_chat_user`, host_id);
        await redis_client.rPush(
          `${host_id}:room_chat_log`,
          JSON.stringify(chat_info)
        );
      } catch (error) {
        console.log(
          "채팅중 레디스에 데이터 넣는 와중 오류 발생",
          error.message,
          error
        );
      }
    };
    redisWork();
    console.log("메세지가 오고 있어요", message_info);
    socket.emit("receive_message", message_info);
  });
};
