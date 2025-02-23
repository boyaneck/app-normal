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
  useParticipants,
} from "@livekit/components-react";
import Video from "../_components/video";
import useUserStore from "@/store/user";
import ChatPage from "../../chat/page";
import ChatRoom from "../../chat/chat_room";
import SubInfo from "../sub/sub_info";
import { useQuery } from "@tanstack/react-query";
import { getUserInfoAboutLive } from "@/api";
const UserLivePage = () => {
  const search_params = useSearchParams();
  const id = search_params.get("user_id");
  const user_nickname = search_params.get("user_nickname");
  const { user } = useUserStore((state) => state);
  const current_host_id = id === null ? "유저없음" : id;
  const current_host_nickname =
    user_nickname === null ? "유저없음" : user_nickname;
  const { data } = useQuery({
    queryKey: ["getUserInfoAboutLive"],
    queryFn: () => getUserInfoAboutLive(current_host_id),
  });
  console.log("현재라이브중인 유저의 라이브 관련 정보", data);

  //로그인유저만 아닌 비로그인 유저도 추가해야함
  const [room_name, set_room_name] = useState("");
  //유저일 때와  , 비로그인 유저일대를
  const { token, name, identity } = useViewrToken(
    user?.user_id,
    user?.user_nickname,
    current_host_id
  );

  useEffect(() => {
    if (current_host_id) {
      set_room_name(current_host_id);

      console.log(
        " 현재 페이지 이동시 해당 호스트의 아이디디",
        current_host_id
      );
    }
  }, []);

  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }
  return (
    <div>
      <div className="grid grid-cols-12">
        {/* 사이드바 */}
        <div className="col-span-12 lg:col-span-2 bg-gray-200">사이드바</div>
        {/* LiveKit Room */}
        <div className="col-span-12 lg:col-span-7 border border-red-500">
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
            className="border border-purple-500 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 h-full"
          >
            <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-3 lg:overflow-y-auto hidden-scrollbar">
              <Video
                host_name={current_host_nickname}
                host_identity={current_host_id}
                token={token}
              />
            </div>
          </LiveKitRoom>
        </div>
        <div className="col-span-12 lg:col-span-3 bg-blue-200">
          <ChatPage />
          채팅창
        </div>
      </div>
      <div className="grid grid-cols-12  bg-sky-300  ">
        <div className="col-span-2 border border-red-40 bg-yellow-200 col-start-1">
          aaa
        </div>
        <div className=" col-span-7 border border-red-600 ">
          <SubInfo />
        </div>
        <div className="col-span-1 border">뭐하ㅡㄴㄴ교</div>
      </div>
    </div>
  );
};

export default UserLivePage;
