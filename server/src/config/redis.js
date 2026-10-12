import { createClient } from "redis";

const channel = {
  chat_channel: process.env.CHAT_CHANNEL,
};
const redis_client = createClient({
  url: process.env.REDIS_URL,
});
const subscriber = redis_client.duplicate();
redis_client.on("error", (err) => console.error("Redis subscriber Error", err));
subscriber.on("error", (err) => console.error("Redis Subscriber Error", err));

const connectRedis = async () => {
  if (!redis_client.isOpen) {
    // 이미 연결되어 있다면 다시 시도하지 않음
    await redis_client.connect();
    console.log("🚀 Redis에 성공적으로 연결되었습니다.");
  }
};
export { redis_client, subscriber, connectRedis, channel };
