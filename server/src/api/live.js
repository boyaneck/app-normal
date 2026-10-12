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

/**
 * 해당 roomName의 직전 방송 데이터 조회
 * getLiveAnalytics에서 현재 방송이 이미 insert된 후 호출되므로
 * started_at DESC 순 2번째 row가 이전 방송
 */
export const getPrevLive = async (roomName) => {
  try {
    const { data, error } = await supabase
      .from("live_stats")
      .select("*")
      .eq("room_name", roomName)
      .order("started_at", { ascending: false })
      .range(1, 1); // 0번째 = 현재, 1번째 = 이전 방송

    if (error) {
      console.error("getPrevLive error:", error.message);
      return null;
    }

    return data?.length ? data[0] : null;
  } catch (err) {
    console.error("getPrevLive error:", err);
    return null;
  }
};

export const insertAvgKeep = async () => {};
