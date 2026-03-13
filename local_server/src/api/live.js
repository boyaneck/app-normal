import { supabase } from "../config/supabase.js";

// export const insertTopParti = async (get_top_parti, room_name) => {
//   console.log(" 최대 동시 시청자수,top_parto", get_top_parti, room_name);
// };

// export const insertAvgParti = async (get_avg_parti, room_name) => {
//   console.log(" =평균시청자수,avg", get_avg_parti, room_name);
// };

import { supabase } from "../config/supabase.js";

export const postLiveStats = async ({
  room_name,
  peakViewers,
  startISO,
  totalVisitors,
  stayedViewers,
  retentionRate,
  category,
  durationMin,
}) => {
  try {
    const { data, error } = await supabase.from("live_stats").insert([
      {
        room_name: room_name,
        peak_viewers: peakViewers,
        started_at: startISO,
        total_visitors: totalVisitors,
        stayed_viewers: stayedViewers,
        retention_rate: parseFloat(retentionRate),
        category: category,
        duration_min: durationMin,
      },
    ]);

    if (error) {
      console.error("supabase insert error:", JSON.stringify(error, null, 2));
      return false;
    } else {
      console.log("live stats saved:", data);
      return true;
    }
  } catch (err) {
    console.error("postLiveStats error:", err);
    return false;
  }
};

export const insertAIReports = async (roomName, report) => {
  try {
    const { error } = await supabase.from("ai_reports").insert({
      room_name: roomName,
      report,
    });
    if (error) throw error;
  } catch (error) {
    console.error(
      "ai_reports 테이블에 데이터 insert 중 오류가 발생했습니다.",
      error,
    );
    throw error;
  }
};

export const insertAvgKeep = async () => {};

export const egressWebRTC = async () => {
  //1.Egress 요청 객체 생성 및 설정
  // const request: StartTrackCompositeEgressREquest = {
  //   room_name: room_id,
  //   //오디오 트랙 설정: 방에 있는 모든 오디오 Egress에 포함
  //   audio_track: {
  //     source: TrackSource.ANY_PUBLISHER,
  //   },
  // };
};
