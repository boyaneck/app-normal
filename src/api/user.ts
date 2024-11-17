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
      "현재 라이브중인 유저의 정보를 가져오는데 문제가 있습니다🚀🚀",
      error
    );

  return data;
};
