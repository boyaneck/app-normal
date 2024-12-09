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
  const current_host_id = id === null ? "유저없음" : id;
  const current_host_nickname =
    user_nickname === null ? "유저없음" : user_nickname;

  const { token, name, identity } = useViewrToken(
    user?.user_id,
    user?.user_nickname
  );

  useEffect(() => {}, []);

  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }

  return (
    <div>
      <div className="font-extrabold">유저의 스트리밍 페에지</div>

      <div className="border border-red-500">
        스크린
        <LiveKitRoom
          token={token}
          server_url={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          className="border border-black w-[200px] h-[200px]"
        >
          {/* <Video
            host_name={current_host_nickname}
            host_identity={current_host_id}
          /> */}
          <Video host_name="123" host_identity="123" />
        </LiveKitRoom>
        나오고 있나요 ??
      </div>
    </div>
  );
};

export default UserLivePage;
