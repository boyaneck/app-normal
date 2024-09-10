import { supabaseForClient } from "@/supabase/supabase_client";

export const insertUserInfo = async () => {};

export const getUserInfo = async (user_email: string) => {
  const { data: userInfo, error: userInfoError } = await supabaseForClient
    .from("users")
    .select("*")
    .eq("useer_email", user_email)
    .single();
  if (userInfoError) console.log("error", userInfoError);

  return userInfo;
};
