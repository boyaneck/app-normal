import { redis_client } from "../config/redis.js";
import { supabase } from "../config/supabase.js";

const LIVE_VIEWER_RANK = `LIVE_VIEWER_RANK`;

export const liveListNow = async (req, res) => {
  //현재 스트리밍을 랜덤하게 보여주는 로직

  try {
    console.log("현재 시청자가 많은 7개의 방송 보기 ");
    const viewer_top7 = await redis_client.zRangeWithScores(
      LIVE_VIEWER_RANK,
      0,
      6,
      {
        REV: true,
      }
    );

    return res.status(200).json(viewer_top7);
  } catch (error) {
    //메인베너에 올라갈, 현재 조회수가 가장 많은 7개의 스트리밍 정보 가져오는 로직
    console.error("Redis 에러 발생:", error);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};
