import { redis_client } from "../config/redis.js";

export const getStartTime = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    console.log("req body 에 해당 아이디가 업습니다.", id);
    return res.status(400).json({ message: "start_time is required" });
  }
  try {
    const start_time = await redis_client.hGet("Demo Room", id);
    console.log("redis 데이터 잘 받아옴", start_time, id);
    const data = {
      message: "Redis에서 해당 스트리머의 방송시간을 성공적으로 가져옵니다.",
      time: start_time,
    };
    console.log("redis 데이터를 다시 클라이언트에게 보내기");
    res.status(200).json(data);
    console.log("제대로 요청이 이루어짐");
  } catch (error) {}
};
