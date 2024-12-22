"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useLiveKitRoom,
  useRoomInfo,
  useRoomContext,
  RoomName,
} from "@livekit/components-react";
import Video from "../_components/video";
import useUserStore from "@/store/user";
import {
  Room,
  ConnectionCheck,
  ConnectionState,
  RoomEvent,
} from "livekit-client";
const UserLivePage = () => {
  const search_params = useSearchParams();
  const id = search_params.get("user_id");
  const user_nickname = search_params.get("user_nickname");
  const { user } = useUserStore((state) => state);
  const current_host_id = id === null ? "유저없음" : id;
  const current_host_nickname =
    user_nickname === null ? "유저없음" : user_nickname;

  //로그인유저만 아닌 비로그인 유저도 추가해야함
  const [roomName, setRoomName] = useState("");
  const { token, name, identity } = useViewrToken(
    user?.user_id,
    user?.user_nickname
  );

  const roomer = "sssssssssssss";
  const { room } = useLiveKitRoom({
    token,
    serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
  });
  useEffect(() => {
    if (current_host_id) {
      setRoomName(current_host_id);
      console.log("useRoomContext", useRoomContext);
      console.log("useRoomInfo", useRoomInfo);
      console.log("LiveKitRoom", LiveKitRoom);
      console.log("유즈 라이브킷 룸", useLiveKitRoom);
      console.log(" 룸 에 대한 정보1!!0", room);
    }
  }, []);

  if (!token || !name || !identity) {
    return (
      <div>
        Cannot watch the stream 토큰이 없을 경우 근데 비로그인 유저도 볼 수
        있어야 하는거 아닌가 ?
      </div>
    );
  }

  return (
    <div>
      <button className="border border-red-300 ">버튼 얍</button>
      <div className="font-extrabold">유저의 스트리밍 페에지</div>
      <div className="border border-red-500">
        스크린
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          room={room}
          className="border border-purple-500 grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3
          xl:grid-cols-3 2xl:grid-cols-6 h-full"
        >
          <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar">
            <Video
              host_name={current_host_nickname}
              host_identity={current_host_id}
              token={token}
            />
          </div>
        </LiveKitRoom>
        나오고 있나요 ??
      </div>
    </div>
  );
};

export default UserLivePage;
