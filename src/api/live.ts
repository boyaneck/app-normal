import { supabaseForClient } from "@/supabase/supabase_client";

export const create_ingress = async (
  user_email: string | undefined,
  server_url: string | undefined,
  stream_key: string | undefined,
  ingress_id: string | undefined
) => {
  const { data, error } = await supabaseForClient.rpc(
    "update_or_insert_live_information",
    { user_email, server_url, stream_key, ingress_id }
  );
  if (error) console.log("Ingress 생성중 에러가 생겼어요!!🚀🚀", error.message);
};
