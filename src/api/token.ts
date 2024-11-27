"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { cookies } from "next/headers";
import { getUserInfoById } from "./user";

//supabase에서 유저의 db가져오기

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

//host_identity는 user_id를 인수로 갖는다.
export const createViewerToken = async (host_identity: string) => {
  console.log("자 여기가 라인입니다");
  let self;
  try {
    self = createClient();
  } catch (error) {
    const id = v4();
    const user_name = `guest#${Math.floor(Math.random() * 1000)}`;
    self = { id, user_name };
  }

  console.log("서버에서 확인하기", host_identity);
  //   //현재 스트리머의 아이디 정보 가져오기
  const host = await getUserInfoById(host_identity);
  if (!host) {
    // throw new Error("User not Found");
  }
  //   // const is_blocked= await 블락드바이유저(host.id)
  //   // if(is_blocked){
  //   //     throw new Error("User is blocked")
  //   // }
  const is_host =
    (self as { id: string; user_name: string }).user_name === host.id;
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      // identity:is_host?`host-${self.id}`:self.id
      // name:self:user_name
      identity: "string",
      name: "string",
    }
  );
  token.addGrant({
    room: host.id,
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
  });
  console.log("과연 슈퍼베이스가 서버에서 해당 유저의 정보를 ?", self);
  return await Promise.resolve(token.toJwt());
};
