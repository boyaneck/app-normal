"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
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
import { useLiveTimer } from "@/hooks/useLiveTimer";

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
  const stream_nav_bar = [
    { id: "chat", icon: "💬" },
    { id: "streamer", icon: "👤" },
    { id: "settings", icon: "⚙️" },
    { id: "info", icon: "🎬" },
  ];
  const live_information = get_user_info_about_live?.live_information[0];
  const [room_name, set_room_name] = useState("");
  //유저일 때와  , 비로그인 유저일대를
  const { token, name, identity } = useViewrToken(
    user?.user_id,
    user?.user_nickname,
    current_host_id
  );

  const icon = useStreamingBarStore((state) => state.icon);
  const [streaming_timer, set_streaming_timer] = useState<string | null>(null);
  const [is_info_active, set_is_info_active] = useState(false);
  const timerRef = useRef<HTMLSpanElement | null>(null);

  const { live_time } = useLiveTimer({ streaming_timer });
  useEffect(() => {
    const URL = process.env.NEXT_PUBLIC_LIVE_POST_API!; // 프로토콜 추가
    const getStreamingStartAt = async () => {
      try {
        const res = await axios.post(URL, { id: "Alicia Doe" });
        const data = res.data;
        set_streaming_timer(data.time);
        console.log("Redis 에있는 시간데이터를 서버를 통해서 받기:", data.time);
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    };

    getStreamingStartAt();
    console.log("HTTP 요청이 이루어짐");
  }, []);
  useEffect(() => {
    const info_active_check = icon.includes("streamer");
    if (info_active_check) {
      set_is_info_active(false);
    } else {
      set_is_info_active(true);
    }
  }, [icon]);
  useEffect(() => {
    if (current_host_id) {
      set_room_name(current_host_id);
    }
  }, []);

  if (!token || !name || !identity) {
    console.log("token,name,identity");
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
          `col-span-11 h-full col-start-2 `,
          is_info_active ? "animate-curtainUp" : "animate-curtainDown"
        )}
        onMouseOver={() => {
          set_show_streamer_info_bar(true);
        }}
        onMouseLeave={() => set_show_streamer_info_bar(false)}
      >
        {/* <LiveKitRoom
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          className="aspect-video object-contain group relative w-full"
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
        </LiveKitRoom> */}
        <div>adasd</div>
        <ChatPage current_host_nickname={current_host_nickname} />
        <StreamerInfoBar show={show_streamer_info_bar} items={stream_nav_bar} />
        <div className={clsx({ "animate-revealDown": is_info_active })}>
          <StreamerInfo
            live_information={live_information}
            current_host_id={current_host_id}
            current_host_email={current_host_nickname}
          />
        </div>
        <div>
          방송 경과 시간: <span ref={timerRef}>{live_time}</span>
        </div>
        <div>린이ㅏㅓㄹ나ㅣㅓㄹㅇ나ㅣㅓㄹㅇ나ㅣㅏㅣㅓㅏㅣㅇ널</div>
      </div>
      <div>으허어허엏어</div>
    </div>
  );
};

export default LivePage;
