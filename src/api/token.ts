"use server";

import { AccessToken, authorizeHeader } from "livekit-server-sdk";
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
 * @param hostID 현새 스트리머의 아이디
 * @returns 게스트 또는 해당 유저의 정보가 들어간 토큰을 발행
 */
export const createViewerToken = async (hostID: string | undefined) => {
  let nowUserInfo;
  try {
    //1.로그인시 supabase로 부터 세션 정보를 받아 브라우저 쿠키에 저장
    //2.next.js 서버에게 브라우저에서 받은 쿠키를 자동으로 넘겨줌
    //3.서버에 도착한 쿠키들 중 supabase 관련 credit을 꺼내어 supabase에게 유효성 검사진행
    const supabase = createServerComponentClient({ cookies });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      nowUserInfo = {
        id: user.id,
        user_nickname: user.user_metadata.user_nickname,
        email: user.email,
      };
    } else {
      nowUserInfo = createGuestUser();
    }
  } catch (error) {
    //에러가 발생해도 게스트로 처리
    console.log("Auth 처리 중 에러발생, 게스트로 전환 ", error);
    nowUserInfo = createGuestUser();
  }

  // 스트리머의 모든 정보 가져오기
  const host = await getUserInfoById(hostID);
  const isHost = nowUserInfo?.id === host?.id;
  console.log("그러면 진짜로 이사람이 호스트 인가요 ??", isHost);
  // LiveKit 토큰 생성
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: isHost ? `HOST-${nowUserInfo.id}` : nowUserInfo.id,
      name: nowUserInfo.email,
    },
  );

  token.addGrant({
    room: hostID,
    roomJoin: true,
    canPublish: isHost,
    canPublishData: true,
  });

  // const tokenStr = await token.toJwt();
  // console.log("타입은 무엇입니까 ??", typeof tokenStr);
  // return tokenStr;
  return await token.toJwt();
};
