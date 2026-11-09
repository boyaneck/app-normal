import { supabaseForClient } from "@/supabase/supabase_client";

export const insertUser = async () => {};

export const getUserInfo = async (user_email: string | undefined) => {
  const { data: userInfo, error: userInfoError } = await supabaseForClient
    .from("users")
    .select("*")
    .eq("user_email", user_email)
    .maybeSingle();
  if (userInfoError) console.log("유저이메일", userInfoError.message);

  return userInfo;
};

export const getUserInfoById = async (user_id: string | undefined) => {
  const { data: userId, error } = await supabaseForClient
    .from("users")
    .select("*")
    .eq("id", user_id)
    .maybeSingle();

  return userId;
};
export const allUserInfo = async () => {
  const { data, error } = await supabaseForClient.from("users").select("*");

  if (error) console.log("모든유저 가져오는 도중 에러남");

  return data;
};

/**
 * 홈 화면: 지금 방송 중인 목록
 * 예전에는 users.isLive = true 를 조회했는데, 이 값을 true로 바꾸는 코드가 어디에도 없어서
 * 방송을 시작해도 목록에 절대 나오지 않았다.
 * 이제 서버(LiveKit 웹훅)가 관리하는 live_information.status = 'live' 를 기준으로 한다.
 * (테이블 간 외래키 유무에 의존하지 않도록 두 번 나눠서 조회)
 */
export const getLiveUser = async () => {
  const { data: lives, error } = await supabaseForClient
    .from("live_information")
    .select("user_id, title, thumb_url, started_at")
    .eq("status", "live")
    .order("started_at", { ascending: false });

  if (error) {
    console.log("현재 라이브중인 방송 목록을 가져오는데 문제가 있습니다🚀🚀", error);
    return [];
  }
  if (!lives?.length) return [];

  const { data: users, error: users_error } = await supabaseForClient
    .from("users")
    .select("*")
    .in(
      "id",
      lives.map((live) => live.user_id),
    );
  if (users_error) console.log("방송 중인 유저 정보 조회 오류", users_error);

  const user_map = new Map((users ?? []).map((u) => [u.id, u]));
  return lives.map((live) => {
    const u = user_map.get(live.user_id);
    return {
      id: live.user_id,
      user_nickname: u?.user_nickname ?? "",
      profile_image: u?.avatar_url ?? u?.profile_image ?? null,
      stream_title: live.title,
      thumb_url: live.thumb_url,
    };
  });
};
