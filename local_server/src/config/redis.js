const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis에 성공적으로 연결.");
  } catch (err) {
    console.error("❌ Redis 연결에 실패:", err);
  }
})();

module.exports = { redisClient };
