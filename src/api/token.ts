"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
import { getUserInfoById } from "./user";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * @returns 게스트를 위한 임의의 정보
 */
const createGuestUser = () => {
  const id = v4();
  const guest_number = Math.floor(Math.random() * 1000);
  return {
    id,
    user_nickname: `게스트${guest_number}`,
    email: `guest${guest_number}@guest.com`,
  };
};

/**
 * @param host_id 현새 스트리머의 아이디
 * @returns 게스트 또는 해당 유저의 정보가 들어간 토큰을 발행
 */
export const createViewerToken = async (host_id: string | undefined) => {
  let now_user_info;
  try {
    //1.로그인시 supabase로 부터 세션 정보를 받아 브라우저 쿠키에 저장
    //2.서버 컴포넌트에게 브라우저에서 받은 쿠키를 넘겨줌
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("토큰이 유효한 토큰인지 확인", user);
    if (user && !error) {
      now_user_info = {
        id: user.id,
        user_nickname: user.user_metadata.user_nickname,
        email: user.email,
      };
    } else {
      now_user_info = createGuestUser();
    }
  } catch (error) {
    //에러가 발생해도 게스트로 처리
    console.log("Auth 처리 중 에러발생, 게스트로 전환 ", error);
    now_user_info = createGuestUser();
  }

  // 스트리머의 모든 정보 가져오기
  const host = await getUserInfoById(host_id);
  const is_host = now_user_info?.id === host?.id;

  // LiveKit 토큰 생성
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: is_host ? `host-${now_user_info.id}` : now_user_info.id,
      name: now_user_info.email,
    }
  );

  console.log("생성된 토큰 확인해보기", token);
  token.addGrant({
    room: host_id,
    roomJoin: true,
    canPublish: is_host,
    canPublishData: true,
  });

  return token.toJwt();
};
