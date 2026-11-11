import { supabase } from "../config/supabase.js";

/**
 * 방송 상태 (live_information.status)
 *
 *   ready / ended ──송출 시작(LiveKit 웹훅)──▶ live
 *        ▲                                       │
 *        └── ended ◀── 통계 정리 완료 ◀── ending ◀── 종료 버튼 / 송출 종료
 *
 * - 상태는 서버만 바꾼다. "지금 진짜 방송 중인가"는 LiveKit 웹훅만 알기 때문.
 *   (설정 페이지의 "방송 시작"은 제목·썸네일만 저장하고 상태는 건드리지 않는다)
 * - waiting 은 더 이상 쓰지 않는다. (DB 제약 호환을 위해 값만 남겨둠)
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
