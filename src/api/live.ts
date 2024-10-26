import { supabaseForClient } from "@/supabase/supabase_client";

export const create_ingress = async (user_email: string | undefined) => {
  const { data, error } = await supabaseForClient.rpc(
    "update_or_insert_live_information",
    { user_email }
  );
  if (error) console.log("Ingress 생성중 에러가 생겼어요!!🚀🚀", error.message);
};
