import { supabaseForClient } from "@/supabase/supabase_client";

interface Props {
  user_email: string;
}

export const addFollow = async (user_email: Props) => {
  const { error } = await supabaseForClient
    .from("users")
    .update("")
    .eq("user_email", user_email);

  if (error) console.log("follow시 문제가 발생했습니다!", error);
};
