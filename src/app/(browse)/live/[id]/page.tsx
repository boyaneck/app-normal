"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LiveKitRoom, RoomContext } from "@livekit/components-react";
import Video from "../_components/video";
import Sample from "../_components/sample";
import useUserStore from "@/store/user";
const UserLivePage = () => {
  const search_params = useSearchParams();
  const id = search_params.get("user_id");
  const user_nickname = search_params.get("user_nickname");
  const { user } = useUserStore((state) => state);

  console.log("현재 유저의 정보", user);
  const current_host_id = id === null ? "유저없음" : id;
  const current_host_nickname =
    user_nickname === null ? "유저없음" : user_nickname;

  const { token, name, identity } = useViewrToken(
    user?.avatar_url,
    user?.user_nickname
  );

  console.log("자 토큰생성됨", { token, name, identity });
  useEffect(() => {}, []);

  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }

  return (
    <div>
      <div className="font-extrabold">유저의 스트리밍 페에지</div>

      <div>
        스크린
        {/* <LiveIndex user={""} stream="" is_following={[""]} token="" />잘 */}
        <LiveKitRoom
          token={token}
          server_url={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        >
          쭈루룩삥퐁뚝뚝뚝
          <Video
            host_name={current_host_nickname}
            host_identity={current_host_id}
          />
        </LiveKitRoom>
        나오고 있나요 ??
      </div>
    </div>
  );
};

export default UserLivePage;
