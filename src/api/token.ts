"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { cookies } from "next/headers";
import { getUserInfoById } from "./user";
import { supabaseForClient } from "@/supabase/supabase_client";

//supabase에서 유저의 db가져오기
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase_middleware";
import { createServer } from "http";
import { createClient } from "@/utils/supabase_server";

// 수정된 createViewerToken 함수
export const createViewerToken = async (host_identity: string) => {
  const data = await createClient();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("이메일만 좀 알고싶은데,", supabase);
  console.log("나와라 유저 진민용", user);
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser()
  //     console.log("createViewerToken이 받은 것은", host_identity);
  //     let current_user_auth;
  //     try {
  //       // updateSession 호출 시 request 객체를 전달
  //       // current_user_auth = await updateSession(request:NextRequest);
  //       current_user_auth=updateSession(request:NextRequest)
  //       const user_server = await current_user_auth; // user_server는 supabase 응답을 포함한 객체
  //     } catch (error) {
  //       const id = v4();
  //       const user_name = `guest#${Math.floor(Math.random() * 1000)}`;
  //       current_user_auth = { id, user_name };
  //     }

  //   // 스트리머의 아이디 정보 가져오기
  //   const host = await getUserInfoById(host_identity);
  //   if (!host) {
  //     // throw new Error("User not Found");
  //   }

  //   // LiveKit 토큰 생성
  //   const token = new AccessToken(
  //     process.env.LIVEKIT_API_KEY,
  //     process.env.LIVEKIT_API_SECRET,
  //     {
  //       identity: "string",
  //       name: "string",
  //     }
  //   );
  //   token.addGrant({
  //     room: host.id,
  //     roomJoin: true,
  //     canPublish: false,
  //     canPublishData: true,
  //   });

  //   return await Promise.resolve(token.toJwt());
};
