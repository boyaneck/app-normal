"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import Video from "../_components/video";
import useUserStore from "@/store/user";
import ChatPage from "../../chat/page";
import { useQuery } from "@tanstack/react-query";
import { getUserInfoAboutLive } from "@/api";
import StreamerInfo from "../_components/streamer_info";
import clsx from "clsx";
import StreamerInfoBar from "../_components/streamer_info_bar";
import { useStreamingBarStore } from "@/store/bar_store";
import { useSocketStore } from "@/store/socket_store";
import axios from "axios";

const LivePage = () => {
  console.log("LIVE 페이지 랜더링");
  const { socket, connect_socket, disconnect_socket } = useSocketStore();
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

  const icon = useStreamingBarStore((state) => state.icon);
  const [is_info_active, set_is_info_active] = useState(false);
  console.log("useffect 바로 위의 랜더링");
  useEffect(() => {
    console.log("POST 요청 전1");
    const URL = process.env.LOCAL_POST_API!; // 프로토콜 추가
    console.log("POST 요청 전2");
    const getStreamingStartAt = async () => {
      try {
        console.log("POST 요청 전3");
        const res = await axios.post(URL, "ALICE");
        console.log("응답 데이터:", res.data);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    };

    getStreamingStartAt();
    console.log("HTTP 요청이 이루어짐");
  }, []);
  useEffect(() => {
    const info_active_check = icon.includes("streamer");
    console.log("기본값이 false가 나와야 하는거 아니야 ?", info_active_check);
    if (info_active_check) {
      set_is_info_active(false);
    } else {
      set_is_info_active(true);
    }
  }, [icon]);
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
    // return <div>Cannot watch the stream</div>;
  }
  return (
    <div
      className={`grid grid-cols-12  
    h-[75vh]  relative
     overflow-hidden`}
    >
      <div
        className={clsx(
          `col-span-11 h-full col-start-2 bg-red-300`,
          is_info_active ? "animate-curtainUp" : "animate-curtainDown"
        )}
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
          className=""
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
        <StreamerInfoBar show={show_streamer_info_bar} items={stream_nav_bar} />
        <div className={clsx({ "animate-revealDown": is_info_active })}>
          <StreamerInfo
            live_information={live_information}
            current_host_id={current_host_id}
            current_host_email={current_host_nickname}
          />
        </div>
        <div>ss</div>
      </div>
    </div>
  );
};

export default LivePage;
