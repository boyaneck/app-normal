"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { getUserInfo, getUserInfoById } from "./user";
import { supabaseForClient } from "@/supabase/supabase_client";

//supabase에서 유저의 db가져오기
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase_middleware";
import { createServer } from "http";
import { createClient } from "@/utils/supabase_server";
import { cookies } from "next/headers";

// 수정된 createViewerToken 함수
export const createViewerToken = async (
  host_identity: string | undefined,
  host_nickname: string | undefined
) => {
  const cookie_store = await cookies();
  const current_user_email = cookie_store.getAll()[0].value;
  let current_user_info;
  try {
    current_user_info = await getUserInfo(current_user_email);
  } catch (error) {
    const id = v4();
    const user_name = `guest#${Math.floor(Math.random() * 1000)}`;
    current_user_info = { id, user_name };
  }

  // 스트리머의 아이디 정보 가져오기
  // const host = await getUserInfoById(host_identity);

  const is_host = current_user_info?.id;
  if (!host_identity) {
    // throw new Error("User not Found");
  }

  // LiveKit 토큰 생성
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: host_identity,
      name: host_nickname,
    }
  );
  token.addGrant({
    room: host_identity,
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
};
