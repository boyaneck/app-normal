import { supabase } from "../config/supabase.js";

/**
 * 방송 상태 (live_information.status)
 *
 *   ready ──방송 시작 버튼──▶ waiting ──OBS 연결(ingress_started)──▶ live
 *     ▲                                                              │
 *     └──────────── ended ◀── 통계 정리 완료 ◀── ending ◀── 종료 버튼 / OBS 종료
 *
 * - waiting 은 브라우저(설정 페이지)가 바꿀 수 있다. "준비됐다"는 표시일 뿐이라 위험하지 않다.
 * - live / ending / ended 는 서버만 바꾼다. "지금 진짜 방송 중인가"는 LiveKit 웹훅만 알기 때문.
 */
export const LIVE_STATUS = {
  READY: "ready",
  WAITING: "waiting",
  LIVE: "live",
  ENDING: "ending",
  ENDED: "ended",
};

export const setLiveStatus = async (roomName, status, extra = {}) => {
  const { error } = await supabase
    .from("live_information")
    .update({ status, ...extra })
    .eq("user_id", roomName);

  if (error) {
    console.error(`[LiveStatus] ${roomName} → ${status} 변경 실패:`, error.message);
    return false;
  }
  console.log(`[LiveStatus] ${roomName} → ${status}`);
  return true;
};

export const getLiveInfo = async (roomName) => {
  const { data, error } = await supabase
    .from("live_information")
    .select("user_id, title, status, started_at")
    .eq("user_id", roomName)
    .maybeSingle();

  if (error) {
    console.error(`[LiveStatus] ${roomName} 조회 실패:`, error.message);
    return null;
  }
  return data;
};

/** 서버 재시작 시 루프 복구용: 지금 방송 중인 방 목록 */
export const getLiveRoomNames = async () => {
  const { data, error } = await supabase
    .from("live_information")
    .select("user_id")
    .eq("status", LIVE_STATUS.LIVE);

  if (error) {
    console.error("[LiveStatus] 방송 중인 방 조회 실패:", error.message);
    return [];
  }
  return (data ?? []).map((row) => row.user_id);
};
