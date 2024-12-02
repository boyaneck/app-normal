"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
const UserLivePage = () => {
  const search_params = useSearchParams();

  const id = search_params.get("user_id");
  const user_nickname = search_params.get("user_nickname");

  console.log("유저의 정보", id, user_nickname);
  const current_id = id === null ? undefined : id;
  const current_user_nickname =
    user_nickname === null ? undefined : user_nickname;

  const { token, name, identity } = useViewrToken(
    current_id,
    current_user_nickname
  );

  console.log("다시하넙ㄴ ㅜ머가문제제인가요?", { token, name, identity });
  useEffect(() => {}, []);

  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }

  return <div>UserLivePage{}</div>;
};

export default UserLivePage;
