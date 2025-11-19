import { createIngress, getLiveUser } from "@/api";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import React, { useCallback, useEffect, useState } from "react";
import Video from "../../live/_components/video";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";
import {
  LIVE_STREAMS,
  MAIN_BANNER_SLIDE_DURATION,
  MAIN_BANNER_VIDEO_DURATION,
  MAIN_BANNER_VISIBLE_COUNT,
  UPCOMING_VIDEOS,
} from "@/utils/main_banner";

const Main_banner = () => {
  const [live_user, set_live_user] = useState<User[]>([]);
  const [curr_idx, set_curr_idx] = useState<number>(0);
  const [slider_stop, set_slider_stop] = useState<boolean>(false);
  const [video_time, set_video_time] = useState<number | undefined>(0);
  const [video_play, set_video_play] = useState<boolean>(true);
  const [progres_key, set_progress_key] = useState(0);
  const [carousel_start_idx, set_carousel_start_idx] = useState<number>(0);
  const [control_visible, set_control_visible] = useState<boolean>(false);
  const setCarouselSlide = useCallback((idx: number) => {
    if (idx >= carousel_start_idx + MAIN_BANNER_VISIBLE_COUNT) {
      set_carousel_start_idx(idx - MAIN_BANNER_VISIBLE_COUNT + 1);
    } else if (idx < carousel_start_idx) {
      set_carousel_start_idx(idx);
    } else if (idx === 0) {
      set_carousel_start_idx(0);
    }

    return;
  }, []);
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };
  const SLIDER_ITEMS = [...LIVE_STREAMS, ...UPCOMING_VIDEOS];

  const curr_items = SLIDER_ITEMS[curr_idx];
  const all_items = SLIDER_ITEMS.length;
  const { user } = useUserStore((state) => state);
  const {
    data: LiveUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  const { token } = useViewerToken("Guest");

  //미리 보기 라이브 영상 2초로 설정,2초마다 슬라이드 됨
  useEffect(() => {
    if (slider_stop || all_items === 0) return;

    const timeout = setTimeout(() => {
      const new_idx = (curr_idx + 1) % all_items;
      set_curr_idx(new_idx);
      set_progress_key((prev) => prev + 1);
      if (new_idx === 0) {
        set_carousel_start_idx(0);
      } else {
        set_carousel_start_idx(new_idx);
      }
    }, MAIN_BANNER_SLIDE_DURATION);

    return () => clearTimeout(timeout);
  }, [curr_idx, all_items]);

  useEffect(() => {
    if (video_time || curr_items.is_live) {
      set_video_time(0);
      return;
    }
    const interval = setInterval(() => {
      set_video_time((prev) => {
        if (prev !== undefined) {
          const next_time = prev + 1;
          if (next_time >= MAIN_BANNER_VIDEO_DURATION) {
            return 0;
          }
        }
      });
    }, 1000);
  }, [video_play, curr_idx, curr_items.is_live]);

  const handle_silde_click = (idx: number) => {};
  const mouseEnter = useCallback(() => set_slider_stop(false), []);
  const mouseLeave = useCallback(() => set_slider_stop(false), []);
  const THUMBNAIL_WIDTH_PLUS_MARGIN = 140;
  return (
    <div
      className="relative h-full border rounded-xl overflow-hidden
     "
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 "
        style={{
          backgroundImage: `url(${curr_items.thumb_url})`,
          filter: "brightness(0.9)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent "></div>
        메인 배너 화면이 들어가는 곳
      </div>

      {/* 여기다가 onmouse를 해야하나? */}
      <div
        className="relative
      z-10 h-full w-full p-8 flex flex-col justify-between text-white border border-black "
      >
        <div>제목</div>
        <div>로고 , 유튜버 이름</div>
        <div>시청자수</div>
        <div>시청자수</div>
        <div
          className=" w-full  space-x-2 overflow-hidden"
          style={{
            maxWidth: `${
              MAIN_BANNER_VISIBLE_COUNT * THUMBNAIL_WIDTH_PLUS_MARGIN
            }px`,
          }}
        >
          <h2 className="text-2xl font-black">
            현재 스트림{curr_items.is_live ? "라이브" : "예정된"}
          </h2>
          {/*  */}
          <div
            className="flex space-x-3 text-sm text-gray-400 transition-transform duration-500 ease-in-out
        "
            style={{
              transform: `translateX(-${
                carousel_start_idx * THUMBNAIL_WIDTH_PLUS_MARGIN
              }px)`,
              width: `${all_items * THUMBNAIL_WIDTH_PLUS_MARGIN}px`,
            }}
          >
            {SLIDER_ITEMS.map((item, idx) => {
              const is_active = idx === curr_idx;
              return (
                <div
                  key={item.id}
                  className={`relative w-32 flex-shrink-0 duration-300 cursor-pointer rounded-lg overflow-hidden transition-all aspect-video ${
                    is_active
                      ? `opacity-100 border-2 border-white`
                      : `opacity-25 border-2 border-transparent`
                  }`}
                >
                  <img
                    src={item.thumb_url}
                    alt={item.title}
                    className="w-full h-full placeholder:rounded-lg object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-500 overflow-hidden">
                    <div
                      className={` h-full bg-white ${
                        is_active ? "animate-slide-progress" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main_banner;
