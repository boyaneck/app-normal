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
import { userInfo } from "os";

interface live_info {
  category: string | null;
  id: string;
  ingress_id: string;
  is_live: boolean;
  server_url: string;
  stream_key: string;
  title: string;
  user_email: string;
  user_id: string;
  visitor: number;
}

interface sub_props {
  live_information: live_info | undefined;
}
const UserLivePage = () => {
  const search_params = useSearchParams();
  const id = search_params.get("host_id");
  const host_nickname = search_params.get("user_nickname");
  const host_email = search_params.get("host_email");
  const { user } = useUserStore((state) => state);
  const current_host_id = id === null ? "유저없음" : id;
  const current_host_nickname =
    host_nickname === null ? "유저없음" : host_nickname;
  const current_host_email = host_email === null ? "유저없음" : host_email;
  const { data: get_user_info_about_live } = useQuery({
    queryKey: ["get_user_info_about_live"],
    queryFn: () => getUserInfoAboutLive(current_host_id),
  });

  const live_information = get_user_info_about_live?.live_information[0];

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
      <div className="grid grid-cols-12  bg-sky-300 h-[70vh]">
        {/* 사이드바 */}
        <div className="col-span-12 lg:col-span-2 ">사이드바</div>
        {/* LiveKit Room */}
        <div
          className=" col-span-12 lg:col-span-9 relative group
        full"
        >
          {/* Video 컨테이너 */}
          <LiveKitRoom
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
            className="border grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 relative"
          >
            <div className=" lg:col-span-7 xl:col-span-7  ">
              <div className="relative">
                {/* Video 컴포넌트를 감싸는 div, relative 추가 */}
                <Video
                  host_name={current_host_nickname}
                  host_identity={current_host_id}
                  token={token}
                />

                <div className="absolute top-0 right-0 flex flex-col space-y-1 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* 네모 박스 컨테이너 */}
                  <div className="w-2 h-2 bg-black rounded"></div>
                  <div className="w-2 h-2 bg-black rounded"></div>
                </div>
                <div className="bg-gray-700 absolute top-0 top-[15vh] flex flex-col w-1/3 h-1/3 bg-transparent ">
                  <ChatPage />
                </div>
              </div>
            </div>
          </LiveKitRoom>

          {/* SubInfo 래퍼 */}

          <div className="absolute bottom-0 left-0 w-full h-24 flex justify-around items-center transform translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <SubInfo
                live_information={live_information}
                current_host_id={current_host_id}
                current_host_email={current_host_nickname}
              />
            </div>
          </div>
        </div>
        {/* <div className="col-span-12 lg:col-span-3 bg-yellow-200">
          채팅
          <ChatPage />
        </div> */}
      </div>
    </div>
  );
};

export default UserLivePage;
