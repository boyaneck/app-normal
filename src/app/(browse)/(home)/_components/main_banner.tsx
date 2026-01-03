import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useViewerToken } from "@/hooks/useViewerToken";
import {
  LIVE_STREAMS,
  MAIN_BANNER_SLIDE_DURATION,
  MAIN_BANNER_VIDEO_DURATION,
  MAIN_BANNER_VISIBLE_COUNT,
  UPCOMING_VIDEOS,
} from "@/utils/main_banner";
import { LiveKitRoom } from "@livekit/components-react";
import { Users } from "lucide-react";
import MainVideo from "./main_video";
import BannerVideo from "./banner_video";
import { UseQueryResult } from "@tanstack/react-query";

interface banner_props {
  score: number;
  thumb_url: string;
  title: string;
  user_id: string;
}

interface banner_obj_props {
  live_list_now: banner_props[];
  // tokenResults: UseQueryResult<string, Error>[];
  tokenResults: (string | undefined)[];
}

const MainBanner = ({ live_list_now, tokenResults }: banner_obj_props) => {
  const [curr_idx, set_curr_idx] = useState<number>(0);
  const [slider_stop, set_slider_stop] = useState<boolean>(false);
  const [progres_key, set_progress_key] = useState(0);
  const [carousel_start_idx, set_carousel_start_idx] = useState<number>(0);
  const [banner_title_in, set_banner_title_in] = useState<boolean>(true);
  const [banner_title_out, set_banner_title_out] = useState<boolean>(true);
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

  console.log("메인베너에서 받은 토큰 결과값", tokenResults);

  //보여줘야 할 모든 배열
  const SLIDER_ITEMS = live_list_now || [];

  const curr_items = SLIDER_ITEMS[curr_idx];
  const all_items = SLIDER_ITEMS.length;

  const curr_token = tokenResults[curr_idx];
  useEffect(() => {
    set_banner_title_in(true);
    const timer = setTimeout(() => {
      set_banner_title_in(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [curr_idx]);
  const bannerTitleTrans = useMemo(() => {
    if (banner_title_out) {
      return `translate-y-[-100%] opacity-0`;
    }
    if (banner_title_in) {
      return `translate-y-[100%] opacity-0`;
    }

    return `translate-y-0 opacity-100`;
  }, [banner_title_out, banner_title_in]);

  const { token } = useViewerToken("Guest");

  //미리 보기 라이브 영상 2초로 설정,2초마다 슬라이드 됨
  useEffect(() => {
    if (slider_stop || all_items === 0) return;
    const EXIT_DELAY = MAIN_BANNER_SLIDE_DURATION - 300;
    const exit_timer = setTimeout(() => {
      set_banner_title_out(true);
    }, EXIT_DELAY);
    const timeout = setTimeout(() => {
      const new_idx = (curr_idx + 1) % all_items;
      set_curr_idx(new_idx);

      set_banner_title_out(false);
      const sss = setTimeout(() => {
        set_banner_title_out(false);
      }, 2000);
      set_progress_key((prev) => prev + 1);
      if (new_idx === 0) {
        set_carousel_start_idx(0);
      } else {
        set_carousel_start_idx(new_idx);
      }
    }, MAIN_BANNER_SLIDE_DURATION);

    return () => clearTimeout(timeout);
  }, [curr_idx, all_items]);

  const mouseEnter = useCallback(() => set_slider_stop(false), []);
  const mouseLeave = useCallback(() => set_slider_stop(false), []);
  if (all_items === 0) {
    return <span>sss</span>;
  }
  const THUMBNAIL_WIDTH_PLUS_MARGIN = 140;
  return (
    <div
      className="relative h-[50vh] border rounded-xl overflow-hidden
     "
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <div>
        <LiveKitRoom
          video={true}
          token={"tokenResults?[curr_idx]."}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        >
          {curr_token ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 "
              style={{
                backgroundImage: `url(${curr_items.thumb_url})`,
                filter: "brightness(0.9)",
              }}
            ></div>
          )}
          <BannerVideo user_id={curr_items?.user_id} token={token} />
        </LiveKitRoom>
      </div>

      {/* 여기다가 onmouse를 해야하나? */}
      <div
        className={`relative flex flex-col justify-between
      z-10 h-full w-full p-8 
      text-white border  `}
      >
        <span
          className={`mb-5
            inline-block
          transition-all duration-300 ease-in-out
       
          ${bannerTitleTrans}
          `}
        >
          <div className="flex items-center space-x-2 ">
            {" "}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center bg-red-600/90 backdrop-blur-xl px-2.5 py-1 rounded-[8px] border border-white/10 shadow-lg">
                <span className="relative flex h-1.5 w-1.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-white leading-none">
                  LIVE
                </span>
              </div>

              <div className="flex items-center bg-white/10 backdrop-blur-2xl px-3 py-1 rounded-[8px] border border-white/10 shadow-lg">
                <Users size={13} className="mr-2 text-white/80" />
                <span className="text-[11px] font-semibold tracking-tight text-white/90 tabular-nums">
                  {curr_items.score.toLocaleString()} 명 시청
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl md:text-5xl font-extrabold tracking-tighter text-white mb-6 leading-[1.05] max-w-3xl drop-shadow-sm">
            {curr_items.title}
          </h1>
        </span>
        <div
          className=" w-full  space-x-2 overflow-hidden"
          style={{
            maxWidth: `${
              MAIN_BANNER_VISIBLE_COUNT * THUMBNAIL_WIDTH_PLUS_MARGIN
            }px`,
          }}
        >
          <h2 className="text-2xl font-black"></h2>
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
                  key={item.user_id}
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

export default MainBanner;
