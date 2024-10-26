import { supabaseForClient } from "@/supabase/supabase_client";

interface streamProps {
  user_email: string | undefined;
  ingress_id: string | undefined;
  server_url: string | undefined;
  stream_key: string | undefined;
}

// export const stream_update = async ({
//   user_email,
//   stream_key,
//   server_url,
//   ingress_id,
// }: streamProps) => {
//   const {} = await supabaseForClient
//     .from("stream")
//     .update([
//       { user_email: user_email },
//       {
//         stream_key: stream_key,
//       },
//       { server_url: server_url },
//       { ingress_id: ingress_id },
//     ])
//     .eq("user_email", user_email);
// };

export const stream_update = async (
  user_email: string | undefined,
  stream_key: string | undefined,
  server_url: string | undefined,
  ingress_id: string | undefined
) => {
  const { data, error } = await supabaseForClient
    .from("stream")
    .update([
      { user_email: user_email },
      {
        stream_key: stream_key,
      },
      { server_url: server_url },
      { ingress_id: ingress_id },
    ])
    .eq("user_email", user_email);

  if (error)
    console.log("스트리밍 관련 정보 업데이터 도중 에러 발생!!", error.message);
};
