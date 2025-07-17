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
import clsx from "clsx";

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
const LivePage = () => {
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
  const [show_streamer_info_bar, set_show_streamer_info_bar] = useState(false);
  const [show_streamer_info, set_show_streamer_info] = useState(false);
  const stream_nav_bar = [
    { id: "chat", icon: "💬" },
    { id: "streamer", icon: "👤" },
    { id: "settings", icon: "⚙️" },
    { id: "info", icon: "🎬" },
  ];
  const live_information = get_user_info_about_live?.live_information[0];
  const [show_chat, set_show_chat] = useState(false);
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
    <div className="grid grid-cols-12  h-[75vh]  relative">
      <div
        className="col-span-11 h-full col-start-2 bg-green-300"
        onMouseOver={() => {
          set_show_streamer_info_bar(true);
        }}
        onMouseLeave={() => set_show_streamer_info_bar(false)}
      >
        <LiveKitRoom
          audio={true}
          aspect-video
          object-contain
          group
          relative
          w-full
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          className="border border-red-500 "
        >
          <Video
            host_name={current_host_nickname}
            host_identity={current_host_id}
            token={token}
            className="object-contain"
            // show_streamer_info_bar={show_streamer_info_bar}
            // set_show_streamer_info_bar={set_show_streamer_info_bar}
            // show_streamer_info={show_streamer_info}
            // set_show_streamer_info={set_show_streamer_info}
          />
        </LiveKitRoom>
        <ChatPage current_host_nickname={current_host_nickname} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-black">
          <div
            className={clsx(
              ` h-8  rounded-xl mb-2
                bg-white/10
                backdrop-blur-lg
                border border-white/20
                shadow-lg
                flex items-center justify-center gap-4
                opacity-1`,
              { "animate-raiseUpBar": show_streamer_info_bar }
            )}
          >
            {stream_nav_bar.map((item, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={clsx(`hover:cursor-pointer hover:scale-110`)}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* <div
          className="border border-black w-4 h-4 cursor-pointer"
          onClick={() => {
            set_show_chat((prev) => !prev);
          }}
        ></div> */}

      {/* <div className={clsx({ "animate-revealDown": show_streamer_info })}>
          <StreamerInfo
            live_information={live_information}
            current_host_id={current_host_id}
            current_host_email={current_host_nickname}
          />
        </div> */}
    </div>
  );
};

export default LivePage;
