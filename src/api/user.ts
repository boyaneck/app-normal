import { supabaseForClient } from "@/supabase/supabase_client";

export const insertUserInfo = async () => {};

export const getUserInfo = async (user_email: string | undefined) => {
  const { data: userInfo, error: userInfoError } = await supabaseForClient
    .from("users")
    .select("*")
    .eq("user_email", user_email)
    .maybeSingle();
  if (userInfoError) console.log("유저이메일", user_email);
  console.log(
    "error",
    userInfoError,
    "데이터 패칭 정보",
    userInfoError?.message,
    userInfoError?.details
  );

  return userInfo;
};

export const getFollowedUser = async () => {
  const { data, error } = await supabaseForClient.from("users").select("*");

  if (error) {
    console.log("팔로우 패칭 에러가 떴어요!", error);
    console.log("팔로우에러메세지", error.message);
    console.log("팔로우에러메세지", error.details);
  }
  console.log("data가 넘어왔나요", data);
  return data;
};
