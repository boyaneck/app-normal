import { redis_client } from "../config/redis";

export const getStartTime = async (req, res) => {
  const { streamer_id } = req.body;
  if (streamer_id) {
    return res.status(400).json({ message: "start_time is required" });
  }
  try {
    const startTime = await redis_client.get(`streamer:${streamer_id}`);
    const data = {
      message: "Redis에서 해당 스트리머의 방송시간을 성공적으로 가져옵니다.",
      time: startTime,
    };
    res.status(200).json(data);
  } catch (error) {}
};
