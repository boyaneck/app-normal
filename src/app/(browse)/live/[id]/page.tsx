"use client";
import { useViewerToken } from "@/hooks/useViewerToken";
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
import { MdOutlineFitScreen } from "react-icons/md";
import { AiOutlineFullscreenExit } from "react-icons/ai";
import LiveListSlide from "../_components/live_list_slide";
import ChattingSlide from "../_components/chatting_slide";

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
  const { token, name, identity } = useViewerToken(current_host_id);
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
      } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
      }
    };

    getStreamingStartAt();
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
    // return <div>Cannot watch the stream</div>;
  }
  const videoRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleFullScreen = () => {
    if (!isFullScreen) {
      // 전체 화면 진입
      if (videoRef?.current?.requestFullscreen) {
        videoRef?.current.requestFullscreen();
      }
    } else {
      // 전체 화면 종료
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const [slide_toggle, set_slide_toggle] = useState<boolean>(true);
  const SlideToggle = () => {
    set_slide_toggle((prev) => !prev);
  };
  const liquidEase = {
    transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  };
  return (
    <div>
      <div className="grid grid-cols-12 h-[75vh] relative ">
        <div
          ref={videoRef}
          className="col-start-2 col-span-7 h-3/4 bg-pink-300"
          onMouseOver={() => {
            set_show_streamer_info_bar(true);
          }}
          onMouseLeave={() => set_show_streamer_info_bar(false)}
        >
          <LiveKitRoom
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
            className="h-full w-full bg-yellow-300"
          >
            <Video
              host_name={current_host_nickname}
              host_identity={current_host_id}
              token={token}
            />
          </LiveKitRoom>

          <StreamerInfoBar
            items={stream_nav_bar}
            show={show_streamer_info_bar}
          />
        </div>
        <div
          className={`col-start-9 col-span-3 
           overflow-hidden relative
           h-3/4 ml-4 rounded-xl border border-black
          `}
        >
          <button onClick={SlideToggle} className="p-2 border border-black">
            버튼
          </button>
          <div
            className={`
            absolute top-10 left-0
            w-full h-[calc(100%-2.5rem)] 
            transition-transform duration-700 z-10 cubic-bezier(0.25, 0.1, 0.25, 1)
            ${slide_toggle ? "translate-x-0" : "translate-x-full"} 
          `}
          >
            <ChatPage
              current_host_nickname={current_host_nickname}
              current_host_id={current_host_id}
            />
          </div>

          <div
            className={`
            absolute top-10 left-0
            w-full h-[calc(100%-2.5rem)]
            transition-transform duration-700 z-20
            bg-blue-600 cubic-bezier(0.25, 0.1, 0.25, 1)
            ${
              slide_toggle
                ? "translate-x-full" // slide_toggle=true (Panel 1 보일 때) -> Panel 2 숨김
                : "translate-x-0" // slide_toggle=false (Panel 2 보일 때) -> Panel 2 표시
            }
          `}
          ></div>
        </div>
        {/*채팅과 라이브목록 슬라이드 */}
      </div>

      {/* <div>
        방송 경과 시간: <span ref={timerRef}>{live_time}</span>
        <StreamerInfo
          live_information={live_information}
          current_host_id={current_host_id}
          current_host_email={current_host_nickname}
        />
        새로운 공간
      </div> */}
    </div>
  );
};

export default LivePage;
