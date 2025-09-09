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
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null); // useEffect 안이 아닌 여기에 선언
  useEffect(() => {
    // 유효성 검사
    const num = Number(streaming_timer);
    if (!streaming_timer) {
      console.log("Redis 에서 방송 시작 시간을 받아오지 못하였습니다.");
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      return;
    }
    if (isNaN(num)) {
      console.log("제대로 된 숫자형 시간이 아닙니다.");
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    }

    const start_time = new Date(num).getTime();
    console.log("시간파싱이 잘되나요 ??", start_time);
    // ----------데이터 잘 가져왔다면

    const updateTimer = () => {
      const now = Date.now();
      const gap = now - start_time;
      const total_seconds = Math.floor(gap / 1000);
      const minutes = Math.floor(total_seconds / 60);
      const seconds = total_seconds % 60;
      let display_time;
      //초당데이터
      if (minutes < 1) {
        console.log("초당데이터 실행중");
        display_time = `${String(seconds).padStart(2, "0")}초`;
        if (total_seconds >= 60 && timerIdRef.current) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = setInterval(updateTimer, 60000);
        }
      } else if (minutes < 60) {
        display_time = `${minutes}분`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remaining_minutes = minutes % 60;
        display_time = `${hours}시간`;
        if (
          remaining_minutes === 0 &&
          total_seconds >= 3600 &&
          timerIdRef.current
        ) {
          console.log("시간 타이머로 전환합니다.");
          clearInterval(timerIdRef.current);
          timerIdRef.current = setInterval(updateTimer, 3600000);
        }

        if (timerRef.current) {
          timerRef.current.innerText = display_time;
        }
      }

      //분당 데이터터
    };

    timerIdRef.current = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => {
      console.log("--- useEffect Cleanup ---");
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
        console.log("Timer cleared during cleanup.");
      }
    };
  }, [streaming_timer]);

  console.log(
    "시간경과 확인해보기",
    typeof streaming_timer,
    timerRef,
    timerIdRef
  );
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
          방송 경과 시간: <span ref={timerRef}>00:00</span>
        </div>
        <div>린이ㅏㅓㄹ나ㅣㅓㄹㅇ나ㅣㅓㄹㅇ나ㅣㅏㅣㅓㅏㅣㅇ널</div>
      </div>
      <div>으허어허엏어</div>
    </div>
  );
};

export default LivePage;
