import { redis_client } from "../config/redis.js";

export const getStartTime = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    console.log("req body 에 해당 아이디가 업습니다.", id);
    return res.status(400).json({ message: "start_time is required" });
  }
  try {
    const start_time = await redis_client.hGet("Demo Room", id);
    const data = {
      message: "Redis에서 해당 스트리머의 방송시간을 성공적으로 가져옵니다.",
      time: start_time,
    };
    res.status(200).json(data);
  } catch (error) {}
};
