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
  useEffect(() => {
    const numericTimer = Number(streaming_timer);

    // 1. 초기값 설정: 유효한 값이 아닐 때만 "00:00"을 표시
    if (isNaN(numericTimer)) {
      if (timerRef.current) {
        timerRef.current.innerText = "시간 오류";
      }
      return;
    }

    // 2. 초기 1초 타이머 설정
    let timer_chk = setInterval(() => {
      const now = Date.now();
      const gap = now - numericTimer;
      const total_seconds = Math.floor(gap / 1000);
      const minutes = Math.floor(total_seconds / 60);
      const seconds = total_seconds % 60;

      // 1분 미만일 때는 초 단위로 표시
      const display_time = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;

      if (timerRef.current) {
        timerRef.current.innerText = display_time;
      }

      // 3. ✅ 1분 이상 경과 시 타이머 재설정
      if (minutes >= 1) {
        clearInterval(timer_chk); // 기존 1초 타이머 중단

        // 1분마다 실행되는 새 타이머 설정
        const minuteTimer = setInterval(() => {
          const newNow = Date.now();
          const newGap = newNow - numericTimer;
          const newMinutes = Math.floor(newGap / (1000 * 60));

          if (timerRef.current) {
            timerRef.current.innerText = `${String(newMinutes).padStart(
              2,
              "0"
            )}:00`;
          }
        }, 60000); // 1분 = 60000ms

        // 새 타이머의 클린업 함수 반환
        return () => clearInterval(minuteTimer);
      }
    }, 1000); // 1초마다 실행

    // 초기 타이머의 클린업 함수
    return () => clearInterval(timer_chk);
  }, [streaming_timer]);
  console.log("타이머", timerRef, "데이트", typeof Date.now());
  useEffect(() => {
    console.log("useffect 안의 콘솔");
    const URL = process.env.NEXT_PUBLIC_LIVE_POST_API!; // 프로토콜 추가
    const getStreamingStartAt = async () => {
      try {
        const res = await axios.post(URL, { id: "Alicia Doe" });
        const timer = res.data;
        set_streaming_timer(timer);
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
    console.log("ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ");
    // return <div>Cannot watch the stream</div>;
  }
  console.log("ㅂㅂㅂㅂㅂㅂㅂㅂㅂㅂㅂ");
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
