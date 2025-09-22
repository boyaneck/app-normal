"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";
import { getUserInfo, getUserInfoById } from "./user";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

// 수정된 createViewerToken 함수

export const createViewerToken = async (
  current_host_id: string | undefined
) => {
  const cookie_store = await cookies();

  let now_user_info;
  //현재 유저의 로그인 유무 확인
  try {
    const supabase = createServerComponentClient({ cookies });
    console.log("쿠키를 확인해보자!!!!!!!", cookies);
    console.log(
      "슈퍼베이스의 쿠키를 통해 데이터 받기",
      await supabase.auth.getUser()
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user) {
      now_user_info = {
        id: user.id,
        user_nickname: user.user_metadata.user_nickname,
        email: user.email,
      };
    } else {
      const id = v4();
      const guest_nickname = `게스트${Math.floor(Math.random() * 1000)}`;
      const guest_email = `게스트${Math.floor(Math.random() * 1000)}@guest.com`;
      now_user_info = { id, user_nickname: guest_nickname, email: guest_email };
      console.log(
        "로그인 유저가 없습니다. 게스트 유저를 생성합니다.",
        now_user_info
      );
    }
  } catch (error) {
    //에러가 발생해도 게스트로 처리
    console.log("토큰 생성중 발생하는 error", error);
    const id = v4();
    const guest_nickname = `게스트${Math.floor(Math.random() * 1000)}`;
    const guest_email = `게스트${Math.floor(Math.random() * 1000)}@guest.com`;
    now_user_info = { id, user_nickname: guest_nickname, email: guest_email };
    console.log(
      "로그인 유저가 없습니다. 게스트 유저를 생성합니다.",
      now_user_info
    );
  }

  // 스트리머의 모든 정보 가져오기
  const host = await getUserInfoById(current_host_id);
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
  console.log("토큰은 과연 누구의 것인가 ??", token);
  token.addGrant({
    room: current_host_id,
    roomJoin: true,
    canPublish: is_host,
    canPublishData: true,
  });

  return token.toJwt();
};
