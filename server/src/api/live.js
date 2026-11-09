import { supabase } from "../config/supabase.js";

/**
 * 방송 1회 통계 저장
 * @returns 저장된 row (id 포함) 또는 실패 시 null
 *  - 예전에는 true/false만 돌려줘서, 방금 저장한 통계가 "몇 번 row인지" 알 수 없었다.
 *  - 이제 id를 돌려주므로 종료 버튼 → 통계 페이지, AI 리포트 연결에 쓸 수 있다.
 */
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
    const { data, error } = await supabase
      .from("live_stats")
      .insert([
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
      ])
      .select("*")
      .single();

    if (error) {
      console.error("supabase insert error:", JSON.stringify(error, null, 2));
      return null;
    }
    console.log("live stats saved:", data.id);
    return data;
  } catch (err) {
    console.error("insertLiveStats error:", err);
    return null;
  }
};

export const insertAIReports = async (roomName, report, liveStatsId) => {
  const { error } = await supabase.from("ai_reports").insert({
    room_name: roomName,
    live_stats_id: liveStatsId,
    report,
  });
  if (error) {
    console.error("ai_reports 테이블에 데이터 insert 중 오류가 발생했습니다.", error);
    throw error;
  }
};

export const hasAIReport = async (liveStatsId) => {
  const { data, error } = await supabase
    .from("ai_reports")
    .select("id")
    .eq("live_stats_id", liveStatsId)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
};

/**
 * 기준 방송(current)의 바로 이전 방송
 * 예전에는 "최신순 2번째 row"로 찾았는데, 리포트 생성이 늦게 돌면 순서가 어긋날 수 있었다.
 * 이제는 기준 방송의 started_at보다 이전인 것 중 가장 최근 것을 찾는다.
 */
export const getPrevLive = async (roomName, beforeStartedAt) => {
  try {
    let query = supabase
      .from("live_stats")
      .select("*")
      .eq("room_name", roomName)
      .order("started_at", { ascending: false })
      .limit(1);

    if (beforeStartedAt) query = query.lt("started_at", beforeStartedAt);
    else query = query.range(1, 1);

    const { data, error } = await query;
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

export const getLatestLiveStats = async (roomName) => {
  const { data, error } = await supabase
    .from("live_stats")
    .select("*")
    .eq("room_name", roomName)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getLatestLiveStats error:", error.message);
    return null;
  }
  return data;
};

export const getLiveStatsById = async (id) => {
  const { data, error } = await supabase
    .from("live_stats")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getLiveStatsById error:", error.message);
    return null;
  }
  return data;
};
