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
import SubInfo from "../_components/streamer_info";
import { useQuery } from "@tanstack/react-query";
import { getUserInfoAboutLive } from "@/api";
import { userInfo } from "os";
import StreamerInfo from "../_components/streamer_info";

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
  const host_nickname = search_params.get("host_nickname");
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

  console.log("자 호스트 닉네임일ㄸ래", host_nickname);
  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }
  return (
    <div className="grid grid-cols-12    relative">
      {/* <div className="col-span-12  lg:col-span-2 bg-yellow-200">Side bar</div> */}
      <div className="col-span-11 h-5/6 col-start-2 ">
        <LiveKitRoom
          audio={true}
          Faspect-video
          object-contain
          group
          relative
          w-full
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          className="border border-red-500 "
        >
          <div className="relative max-width: 500px; max-height: 300px;">
            <Video
              host_name={current_host_nickname}
              host_identity={current_host_id}
              token={token}
              className="object-contain 
                  "
            />

            <div className="absolute top-[15vh] right-0 flex flex-col w-2/5 h-4/5 bg-transparent ">
              <ChatPage current_host_nickname={current_host_nickname} />
            </div>
          </div>
        </LiveKitRoom>

        {/* SubInfo 래퍼 */}

        <div className="border border-green-600">
          <StreamerInfo
            live_information={live_information}
            current_host_id={current_host_id}
            current_host_email={current_host_nickname}
          />
        </div>
      </div>
    </div>
  );
};

export default UserLivePage;
