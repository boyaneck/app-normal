import { supabaseForClient } from "@/supabase/supabase_client";

//로그인 하면 해당 유저의 follow테이블의 row를 체크하고 없을 경우 생성,

//팔로우 & 언팔로우
export const toggleFollow = async (
  current_user_email: string,
  target_user_email: string,
  user_id: string
) => {
  const { data, error } = await supabaseForClient.rpc("follow_user", {
    target_user_email,
    current_user_email,
  });
  if (error) console.log("");
};

export const getFollowingUsers = async (current_user_email: string) => {
  const { data, error } = await supabaseForClient
    .from("follow")
    .select("*")
    .eq("user_email", current_user_email);

  if (error)
    console.log(
      "현재 유저의 모든 팔로우한 유저를 가져오는데 에러발생!🚀🚀",
      error.message
    );
  return data;
};

//해당 유저의 팔로잉한 유저 가져오기

export const getFollowingUsersInfo = async (user_email: string[]) => {
  // console.log("무엇을 받아옵니까", user_email);
  const { data, error } = await supabaseForClient
    .from("live_information")
    .select("*")
    .in("user_email", user_email);

  if (error)
    console.log(
      "현재 팔로잉한 유저의 정보를 가져오는중 에러발생!🚀🚀",
      error.message
    );

  console.log("현재 팔로우한 유저의 모든 정보 넘겨주기", data);
  return data;
};
