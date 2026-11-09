import { supabaseForClient } from "@/supabase/supabase_client";
import { LiveStatsProps } from "@/types/live";
import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SERVER_URL, getAuthHeaders } from "@/lib/server-api";
interface live_info_insert_props {
  user_email?: string;
  thumb_url: string;
  title: string;
  desc: string;
  user_id?: string;
}

interface viewer {
  value: string;
}
//Ingress API
export const insertIngress = async (
  user_id: string | undefined,
  target_user_email: string | undefined,
  stream_key: string | undefined,
  server_url: string | undefined,
  ingress_id: string | undefined,
) => {
  const { data, error } = await supabaseForClient.rpc("abc", {
    user_id: user_id,
    target_user_email: target_user_email,
    stream_key: stream_key,
    server_url: server_url,
    // ingress_id: ingress_id,
  });

  if (error) console.log("Ingress 생성중 에러가 생겼어요!!🚀🚀", error.message);
};

// export const getUserInfoAboutLive = async (user_id: string | undefined) => {
//   const { data: userInfoLive, error: userInfoError } = await supabaseForClient
//     .from("users")
//     .select(
//       `
//       live_information (
//         *
//       )
//     `
//     )
//     .eq("id", user_id)
//     .maybeSingle();

//   if (userInfoError) {
//     console.log("유저 정보 가져오기 에러:", userInfoError.message);
//     return null; // 에러 발생 시 null 반환 또는 에러 처리
//   }

//   return userInfoLive;
// };
export const getRecommendLiveList = async (roomName: string) => {
  const res = await axios.get(
    `${SERVER_URL}/live/live-recommend?roomName=${roomName}`,
  );
  return res.data;
};

export const getHomeTrendingLiveList = async () => {
  const res = await axios.get(`${SERVER_URL}/live/live-home`);

  return res.data;
};

export const getLiveStatsWeek = async (roomName: string | undefined) => {
  console.log("제대로 된 방송 넘버 ", roomName);
  const { data: liveStats, error } = await supabaseForClient
    .from("live_stats")
    .select("*")
    .eq("room_name", roomName)
    .order("started_at", { ascending: false })
    .limit(7);

  console.log("리턴값 ", liveStats);
  if (error) {
    console.log("❌방송 종료후 방송통계를 가져오는데 오류 발생", error.message);
    throw new Error(error.message);
  }

  return liveStats ? liveStats : null;
};

// 가장 최근 방송 1회의 종료 후 통계
export const getPostLiveStats = async (roomName: string | undefined) => {
  const { data, error } = await supabaseForClient
    .from("live_stats")
    .select("*")
    .eq("room_name", roomName)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.log("❌최근 방송 통계를 가져오는데 오류 발생", error.message);
    throw new Error(error.message);
  }

  return data;
};

interface props {
  user_email?: string;
  thumb_url: string;
  title: string;
}
/**
 * Supabase 에러 → 화면에 보여줄 원인
 * "저장 실패"만 보여주면 원인을 알 수 없어서, 자주 나는 에러를 번역한다.
 */
const explainSaveError = (error: unknown) => {
  const e = error as { code?: string; message?: string };
  const msg = e?.message ?? "";
  if (e?.code === "42P10")
    return "DB 설정이 필요해요: live_information.user_id 에 unique 제약이 없어요.";
  if (e?.code === "42703" || /column .* does not exist/i.test(msg))
    return "DB 업데이트가 필요해요: migration.sql 을 실행해주세요.";
  if (/row-level security/i.test(msg))
    return "저장 권한이 없어요. 다시 로그인해주세요.";
  if (/failed to fetch|network/i.test(msg)) return "인터넷 연결을 확인해주세요.";
  return `저장에 실패했어요. (${msg || "알 수 없는 오류"})`;
};

/**
 * 방송 설정 저장 + 상태를 waiting(OBS 연결 대기)으로 변경
 * @returns { ok, reason } — 실패하면 reason에 화면에 보여줄 원인
 *
 * - 썸네일은 압축된 이미지(data URL)를 thumb_url 컬럼에 그대로 저장한다. (Storage 사용 안 함)
 * - 로그인 세션이 실린 클라이언트를 써서 RLS(본인 row만 수정)를 적용할 수 있게 했다.
 * - 이미 방송 중(live)이면 상태를 waiting으로 덮어쓰지 않는다.
 */
export const insertAndUpdateLiveInfo = async ({
  user_id,
  thumb_url,
  title,
  desc,
}: live_info_insert_props): Promise<
  { ok: true } | { ok: false; reason: string }
> => {
  if (!user_id) return { ok: false, reason: "로그인이 필요해요." };
  const supabase = createClientComponentClient();

  try {
    const { error } = await supabase
      .from("live_information")
      .upsert({ user_id, thumb_url, title, desc }, { onConflict: "user_id" });
    if (error) throw error;

    const { error: status_error } = await supabase
      .from("live_information")
      .update({ status: "waiting" })
      .eq("user_id", user_id)
      .neq("status", "live");
    if (status_error) throw status_error;

    return { ok: true };
  } catch (error) {
    console.error("방송 설정 저장 중 오류 발생:", error);
    return { ok: false, reason: explainSaveError(error) };
  }
};

export type LiveStatus = "ready" | "waiting" | "live" | "ending" | "ended";

/** 모니터링 페이지에서 방송 상태(OBS 연결 대기 / 방송 중 / 종료) 확인용 */
export const getLiveStatus = async (user_id: string | undefined) => {
  if (!user_id) return null;
  const { data, error } = await supabaseForClient
    .from("live_information")
    .select("status")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) {
    console.error("방송 상태 조회 오류:", error.message);
    return null;
  }
  return (data?.status ?? "ready") as LiveStatus;
};

/**
 * 방송 종료 (Express POST /live/end)
 * 어떤 방송을 끌지는 서버가 로그인 토큰으로 정한다 → body에 user_id를 보내지 않는다.
 * @returns 방금 끝난 방송의 live_stats id (통계 페이지 이동용)
 */
export const endLive = async () => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${SERVER_URL}/live/end`, {}, { headers });
  return data as { result: string; liveStatsId: number | string | null };
};

export interface AIReport {
  summary?: string;
  good?: string[];
  improve?: string[];
  suggestions?: string[];
}

/** 방송 1회에 대한 AI 리포트 (방송 종료 후 서버가 비동기로 생성 → 없으면 null) */
export const getAIReport = async (
  live_stats_id: number | string | undefined,
) => {
  if (!live_stats_id) return null;
  const { data, error } = await supabaseForClient
    .from("ai_reports")
    .select("report, created_at")
    .eq("live_stats_id", live_stats_id)
    .maybeSingle();
  if (error) {
    console.error("AI 리포트 조회 오류:", error.message);
    return null;
  }
  return (data?.report ?? null) as AIReport | null;
};

// 예전에는 host_id 조건 없이 결제 테이블 전체를 가져와서
// 다른 스트리머의 후원자가 섞여 보이고, 모든 결제 데이터가 브라우저로 내려갔다.
export const getTopSupporters = async (hostId: string | undefined) => {
  if (!hostId) return [];
  const { data, error } = await supabaseForClient
    .from("payments")
    .select("user_nickname, amount")
    .eq("host_id", hostId);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // amount가 text 타입이라 직접 집계
  const map = new Map<string, { amount: number; count: number }>();
  for (const row of data) {
    const amt = parseInt(row.amount ?? "0", 10) || 0;
    const nick = row.user_nickname ?? "익명";
    const prev = map.get(nick) ?? { amount: 0, count: 0 };
    map.set(nick, { amount: prev.amount + amt, count: prev.count + 1 });
  }

  return Array.from(map.entries())
    .map(([nickname, { amount, count }]) => ({ nickname, amount, count }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

export const getWeeklyDonations = async (hostId: string | undefined) => {
  if (!hostId) return [];

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseForClient
    .from("payments")
    .select("amount, paid_at")
    .eq("host_id", hostId)
    .gte("paid_at", weekAgo.toISOString());

  if (error) {
    console.error("주간 후원 데이터 로드 오류:", error.message);
    return [];
  }

  const dayNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  const byDay = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo);
    d.setDate(weekAgo.getDate() + i);
    byDay.set(dayNames[d.getDay()], 0);
  }

  for (const row of data ?? []) {
    if (!row.paid_at) continue;
    const dayName = dayNames[new Date(row.paid_at).getDay()];
    const amt = parseInt(row.amount ?? "0", 10) || 0;
    byDay.set(dayName, (byDay.get(dayName) ?? 0) + amt);
  }

  return Array.from(byDay.entries()).map(([name, 후원금액]) => ({
    name,
    후원금액,
  }));
};

export const getLiveListNow = async () => {
  try {
    const viewers_top7 = await axios.get(`${SERVER_URL}/live/live_list_now`);
    const viewers_top7_info = viewers_top7.data;
    if (!viewers_top7_info || viewers_top7_info.length === 0) return [];
    const score_map = new Map(
      viewers_top7_info.map((item: any) => [item.value, item.score]),
    );
    const room_name = viewers_top7_info.map((item: viewer) => item.value);
    // const viwers_top7=viewers_top7_info.map((item)=>item.)

    const { data: live_info, error: live_info_error } = await supabaseForClient
      .from("live_information")
      .select("*")
      .in("user_id", room_name)
      .eq("status", "live");
    const combined_info = live_info?.map((info) => {
      return {
        user_id: info.user_id,
        title: info.title,
        thumb_url: info.thumb_url,
        score: Number(score_map.get(info.user_id)) || 0,
      };
    });

    if (live_info_error) {
      console.error(
        " 현재 라이브가 많은 상위 7개의 영상 Supabase 상세 조회 중 에러 발생:",
        live_info_error,
      );
      throw live_info_error;
    }
    return combined_info;
  } catch (error) {}
};
