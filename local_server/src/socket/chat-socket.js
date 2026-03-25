import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/live-webhook.js";






const RATE_LIMIT = {
  maxMsg: 3,
  windowSec: 1,
  ttlSec: 2,
};

const chkMsgLimitSec = async (id) => {
  const key = `limitSec${id}:${Math.floor(Date.now() / 1000)}`;
  const count = await redis_client.incr(key);

  if (count === 1) await redis_client.expire(key, RATE_LIMIT.ttlSec);

  return;
};

const escapeHTML = (str) => {
  if (typeof str !== "string") return str;
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return str.replace(/[&<>"']/g, (text) => map[text]);
};

const intoChatRate = async (hostId, id) => {
  try {
    const chkCounted = await redis_client.sIsMember(`${hostId}:`);

    if (chkCounted) return;
  } catch (error) {}
};

export const chatSocket = (socket, namespaceRoom) => {
  console.log("socket 로그 ", socket);

  const {
    hostId,
    userNickname,
    avatarURL,
    msg,
    date,
    id,
    email,
    chatroomNumber,
  } = socket();

 const redisKey=getRedisKeys(hostId)

  socket.on("join_room",async()=>{
    
    //Room 입장
    socket.join(hostId)

    const msgHistory = redis_client.lRange(redisKey.MSG,0,49)
    if()


  })

    try {
      
    } catch (error) {
      
    }

  // const initPubSub=async()=>{
  //   try {
  //     await pubClient.connect()
  //     pubReady=true
  //     console.log("Redis Pub 연결 완료")

  //     await subClient.connect()
  //     subReady=true
  //     console.log("Redis Sub 연결 완료")
  //   } catch (error) {
  //     console.log("Redis Pub/Sub 연결 실패",error.message)
  //   }
  // }

  // initPubSub()

  socket.on("send_message", async ({ message_info }) => {
    try {
      const chat_num = message_info?.current_chat_room_number;
      const user_nickname = message_info?.user_nickname;
      const msg_date = message_info?.date;
      const host_id = message_info?.current_host_id;
      const chat_info = {
        user_nickname,
        msg_date,
        chat_num,
        host_id,
      };
      console.log("메세지 정보 확인하기", message_info);
      socket.emit("receive_message", message_info);
      if (chat_num) {
        const message_data = JSON.stringify(message_info);
        await redis_client.sAdd(`${host_id}:room_chat_user`, host_id);
        await redis_client.rPush(
          `${host_id}:room_chat_log`,
          JSON.stringify(chat_info),
        );

        //채팅 참여율 계산하기
        //1분이상 넘긴 유저들의 수
        const duration_over_minute_count = await redis_client.sCard(
          `${host_id}:duration_over_minute`,
        );

        //1분을 넘기면서 동시에 채팅도 한 유저들
        const over_minute_and_chatted = await redis_client.sInter([
          `${host_id}:duration_over_minute`,
          `${host_id}:room_chat_user`,
        ]);
        const qualified_user = over_minute_and_chatted.length;
        const over_minute_and_chatted_user_ratio =
          duration_over_minute_count === 0
            ? 0
            : (qualified_user / duration_over_minute_count) * 100;
        const involved_rate = over_minute_and_chatted_user_ratio.toFixed(2);

        console.log(
          "해당 방의 채팅 참여율은 ?",
          over_minute_and_chatted_user_ratio + "%",
        );
        const stored_max_rate = await redis_client.get(
          `${host_id}:chat_involved_rate`,
        );
        const ratio = stored_max_rate ? Number(stored_max_rate) : 0;

        if (over_minute_and_chatted_user_ratio > ratio) {
          await redis_client.set(
            `${host_id}:chat_involved_rate`,
            involved_rate,
          );
          console.log(
            "채팅참여율이 올라갔으며, 올라간 값으로 데이터를 저장",
            involved_rate,
          );
        } else {
          console.log(
            "채팅 참여율은 그대로 유지되었다.",
            stored_max_rate.toFixed(2),
          );
        }
        // await redis_client_chat.expire(redis_chat_key,60*60*24)a
      }

      console.log("메세지 정보 확인하기", message_info);
      // socket.emit("receive_message", message_info);
    } catch (error) {}
  });
};
