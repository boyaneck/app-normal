import { supabaseForClient } from "@/supabase/supabase_client";
import { post_live_stats_props } from "@/types/live";
import axios from "axios";
import { randomUUID } from "crypto";
interface live_info_insert_props {
  user_email?: string;
  thumb_url: string;
  title: string;
  desc: string;
  user_id?: string;
}
//Ingress API
export const insertIngress = async (
  user_id: string | undefined,
  target_user_email: string | undefined,
  stream_key: string | undefined,
  server_url: string | undefined,
  ingress_id: string | undefined
) => {
  console.log(user_id, target_user_email, stream_key, server_url, ingress_id);
  console.log("타입알아보기", typeof user_id);
  const { data, error } = await supabaseForClient.rpc("abc", {
    user_id: user_id,
    target_user_email: target_user_email,
    stream_key: stream_key,
    server_url: server_url,
    // ingress_id: ingress_id,
  });

  if (error) console.log("Ingress 생성중 에러가 생겼어요!!🚀🚀", error.message);
};

export const getUserInfoAboutLive = async (user_id: string | undefined) => {
  console.log("API 에서 확인하기", user_id);
  const { data: userInfoLive, error: userInfoError } = await supabaseForClient
    .from("users")
    .select(
      `
      live_information (
        *    
      )
    `
    )
    .eq("id", user_id)
    .maybeSingle();

  if (userInfoError) {
    console.log("유저 정보 가져오기 에러:", userInfoError.message);
    return null; // 에러 발생 시 null 반환 또는 에러 처리
  }

  return userInfoLive;
};
export const getPostLiveStatsWeek = async (room_name: string | undefined) => {
  const { data: post_live_stats, error } = await supabaseForClient
    .from("post_live_stats")
    .select("*")
    .eq("broad_num", room_name)
    .order("live_started_at", { ascending: false })
    .limit(7);

  if (error) {
    console.log("❌방송 종료후 방송통계를 가져오는데 오류 발생", error.message);
    throw new Error(error.message);
  }

  return post_live_stats ? post_live_stats : null;
};

export const getWeekleyPost = async (room_name: string) => {
  const today = new Date();
  const end_date = today.toISOString();
  const a_week_ago = new Date(today);
  a_week_ago.setDate(today.getDate() - 6);
  a_week_ago.setHours(0, 0, 0, 0);
  const start_date = a_week_ago.toISOString();
  const { data: weekly_data, error } = await supabaseForClient
    .from("post_live_stats")
    .select("*")
    .eq("broad_num", room_name)
    .gte("live_started_at", start_date)
    .lte("live_started_at", end_date)
    .order("live_started_at", { ascending: false });

  if (error) {
    console.log("7일치 데이터 로드시 오류 ", error);
    return [];
  }
  return weekly_data;
};

interface props {
  user_email?: string;
  thumb_url: string;
  title: string;
}
export const insertAndUpdateLiveInfo = async ({
  user_id,
  thumb_url,
  title,
  desc,
}: live_info_insert_props) => {
  const { data, error } = await supabaseForClient
    .from("live_information")
    .upsert(
      {
        user_id,
        thumb_url,
        title,
        desc,
      },
      { onConflict: "user_id" }
    );
  if (error) {
    console.error("저장 중 오류 발생:", error.message);
    return null;
  }
};

export const getLiveListNow = async () => {
  console.log("얍얍얍얍ㅇ뱡뱡뱡뱌");
  try {
    const res = await axios.get("http://localhost:3001/live/live_list_now");
  } catch (error) {}
};
