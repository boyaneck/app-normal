import { supabaseForClient } from "@/supabase/supabase_client";
import { post_live_stats_props } from "@/types/live";

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
export const getPostLiveStats = async (room_name: string | undefined) => {
  console.log("방송통계 api 실행", room_name);
  const { data: post_live_stats, error } = await supabaseForClient
    .from("post_live_stats")
    .select("*")
    .eq("broad_num", room_name)
    .order("live_started_date", { ascending: false })
    .limit(1);

  if (error) {
    console.log("❌방송 종료후 방송통계를 가져오는데 오류 발생");
    throw new Error(error.message);
  }

  console.log("방송이 끝난 후 통계를 가져오는 통계 API", post_live_stats);
  return post_live_stats ? (post_live_stats[0] as post_live_stats_props) : null;
};
