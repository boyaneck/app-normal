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

export const allUserInfo = async () => {
  const { data, error } = await supabaseForClient.from("users").select("*");

  if (error) console.log("모든유저 가져오는 도중 에러남");

  return data;
};

export const getLiveUser = async () => {
  const { data, error } = await supabaseForClient
    .from("users")
    .select("*")
    .eq("isLive", true);

  if (error)
    console.log(
      "현재 라이브중인 유저의 정보를 가져오는데 문제가 있습니다",
      error
    );

  console.log("현재라이브중인 유저정보 ", data);
  return data;
};
