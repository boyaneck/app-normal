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
