import { supabaseForClient } from "@/supabase/supabase_client";

export const createIngress = async (
  user_id: string | undefined,
  target_user_email: string | undefined,
  stream_key: string | undefined,
  server_url: string | undefined,
  ingress_id: string | undefined
) => {
  console.log(user_id, target_user_email, stream_key, server_url, ingress_id);
  console.log("타입알아보기", typeof user_id);
  const { data, error } = await supabaseForClient.rpc("abc", {
    user_id: user_id,
    target_user_email: target_user_email,
    stream_key: stream_key,
    server_url: server_url,
    // ingress_id: ingress_id,
  });

  if (error) console.log("Ingress 생성중 에러가 생겼어요!!🚀🚀", error.message);
};
