import { subscriber, channel } from "../config/redis";
export const initSubscriber = (io) => {
  console.log("Redis 구독이 초기 실행중입니다.✅");

  subscriber.on(`message`, (channel, message) => {
    try {
      const parsed_msg = JSON.parse(message);
      console.log(`채널로부터 메세지를 받음:`, parsed_msg);

      // if(channel)
    } catch (error) {
      console.error(`구독한 Redis의 메세지를 받던 중 오류 발생!🚀`);
    }
  });

  subscriber.subscribe(channel, (error, count) => {
    if (error) {
      console.log(`Redis 채널을 구독하는데 실패하였습니다.😢`, error);
      return;
    }
    console.log(`성공적으로 구독을 성공하였습니다.✨`);
  });

  const sacntion_user = (io) => {
    const { user_id, streamer_id, reason, duration } = payload;
    const streamer = `streamer-${streamer_id}`;
    const user = `user-${user_id}`;

    if (type === `sanction`) {
    }
  };
};
