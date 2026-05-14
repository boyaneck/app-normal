import { supabase } from "../config/supabase.js";

export const insertLiveStats = async ({
  roomName,
  peakViewers,
  startISO,
  totalVisitors,
  stayedViewers,
  retentionRate,
  intoChatRate,
  category,
  durationMin,
  fund = 0,
  donationCount = 0,
  donationUniqueUsers = 0,
  avgViewer = 0,
  viewerTimeseries = [],
  donationTimeseries = [],
}) => {
  try {
    const { data, error } = await supabase.from("live_stats").insert([
      {
        room_name: roomName,
        peak_viewers: peakViewers,
        started_at: startISO,
        total_visitors: totalVisitors,
        stayed_viewers: stayedViewers,
        retention_rate: parseFloat(retentionRate),
        into_chat_rate: parseFloat(intoChatRate ?? 0),
        category: category,
        duration_min: durationMin,
        fund,
        avg_viewer: avgViewer,
        donation_count: donationCount,
        donation_unique_users: donationUniqueUsers,
        viewer_timeseries: viewerTimeseries,
        donation_timeseries: donationTimeseries,
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

export const getPrevLive = async (roomName) => {
  try {
    const { data, error } = await supabase
      .from("live_stats")
      .select("*")
      .eq("room_name", roomName)
      .order("started_at", { ascending: false })
      .range(1, 5);
    if (error) throw error;

    return data || [];
  } catch (error) {
    console.log(
      "호스트의 지난 최신 5개의 방송 데이터를 가져오는데 오류가 발생했습니다.",
      error,
    );
    return [];
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
