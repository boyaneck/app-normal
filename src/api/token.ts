"use server";

import { AccessToken } from "livekit-server-sdk";
import { v4 } from "uuid";

import { getUserInfo, getUserInfoById } from "./user";

//supabase에서 유저의 db가져오기

import { cookies } from "next/headers";

// 수정된 createViewerToken 함수
export const createViewerToken = async (
  user_identity: string | undefined,
  user_nickname: string | undefined,
  current_host_id: string | undefined
) => {
  const cookie_store = await cookies();

  let current_user_info;
  let current_user_email;
  //현재 유저의 로그인 유무 확인
  if (cookie_store.getAll().length >= 1) {
    try {
      current_user_email = cookie_store.getAll()[0].value;
      current_user_info = await getUserInfo(current_user_email);
    } catch (error) {
      console.log("해당 방에 접속시 유저의 쿠키에 오류가 생겼습니다.", error);
    }
  } else {
    try {
      const id = v4();
      const user_nickname = `게스트#${Math.floor(Math.random() * 1000)}`;
      current_user_email = `게스트@#${Math.floor(Math.random() * 1000)}.com`;
      current_user_info = { id, user_nickname, current_user_email };
      console.log("로그인 유저가 업습니다", current_user_info);
    } catch (error) {
      console.log(
        "해당 방에 접속시 유저의 쿠키가 존재하지 않으며, 오류가 생겼습니다.",
        error
      );
    }
  }

  // 스트리머 혹은 현재 유저의 아이디 정보 가져오기
  const host = await getUserInfoById(current_host_id);

  const is_host = current_user_info?.id === host?.id;
  console.log(
    "이거는 false가 나와야 하는거 아니냐 ???",
    is_host,
    "현재유저",
    user_identity,
    "스트리머",
    current_host_id
  );
  if (!user_identity) {
    throw new Error("host_user not Found");
  }

  console.log("구글 로그인시 유저의 정보는??", current_user_info);
  console.log("구글 로그인시 유저의 이메일은 ???", current_user_email);
  console.log("현재 로그인된 사람 호스트유무 확인", is_host);
  // LiveKit 토큰 생성
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: is_host ? `host-${current_user_info.id}` : current_user_info.id,
      name: current_user_email,
    }
  );
  token.addGrant({
    room: user_identity,
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
};
