const { createClient } = require("redis");
require("dotenv").config();

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
  await Promise.all([redis_client.connect(), subscriber.connect()]);
  console.log("Redis subscriber and Subscriber connected.");
};

module.exports = { redis_client, subscriber, connectRedis, channel };
