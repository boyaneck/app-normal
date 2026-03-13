import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useViewerToken } from "@/hooks/useViewerToken";
import {
  MAIN_BANNER_SLIDE_DURATION,
  MAIN_BANNER_VISIBLE_COUNT,
} from "@/utils/main_banner";
import { LiveKitRoom } from "@livekit/components-react";
import { Users, Play } from "lucide-react";
import BannerVideo from "./banner_video";

interface banner_props {
  score: number;
  thumb_url: string;
  title: string;
  user_id: string;
}

interface banner_obj_props {
  live_list_now: banner_props[];
  tokenResults: (string | undefined)[];
}

const MainBanner = ({ live_list_now, tokenResults }: banner_obj_props) => {
  const [curr_idx, set_curr_idx] = useState<number>(0);
  const [slider_stop, set_slider_stop] = useState<boolean>(false);
  const [carousel_start_idx, set_carousel_start_idx] = useState<number>(0);
  const [banner_title_in, set_banner_title_in] = useState<boolean>(true);
  const [banner_title_out, set_banner_title_out] = useState<boolean>(false);

  // 0.5초 뒤 영상 전환을 위한 상태
  const [show_live, set_show_live] = useState(false);

  const SLIDER_ITEMS = live_list_now || [];
  const curr_items = SLIDER_ITEMS[curr_idx];
  const all_items = SLIDER_ITEMS.length;

  //로그인을 하나 안하나 게스트용 토큰으로 사용 ?
  const { token: guestToken } = useViewerToken("Guest");

  // 아이템 변경 시 타이틀 애니메이션 및 영상 전환 타이머
  useEffect(() => {
    set_show_live(false); // 아이템이 바뀌면 일단 썸네일로 초기화
    set_banner_title_in(true);

    // 0.5초(500ms) 후에 영상을 보여주도록 설정
    const videoTimer = setTimeout(() => {
      set_show_live(true);
    }, 500);

    const titleTimer = setTimeout(() => {
      set_banner_title_in(false);
    }, 100);

    return () => {
      clearTimeout(videoTimer);
      clearTimeout(titleTimer);
    };
  }, [curr_idx]);

  const bannerTitleTrans = useMemo(() => {
    if (banner_title_out) return `translate-y-[-20px] opacity-0`;
    if (banner_title_in) return `translate-y-[20px] opacity-0`;
    return `translate-y-0 opacity-100`;
  }, [banner_title_out, banner_title_in]);

  // 자동 슬라이드 로직
  useEffect(() => {
    if (slider_stop || all_items === 0) return;
    const EXIT_DELAY = MAIN_BANNER_SLIDE_DURATION - 500;

    const exit_timer = setTimeout(() => {
      set_banner_title_out(true);
    }, EXIT_DELAY);

    const timeout = setTimeout(() => {
      const new_idx = (curr_idx + 1) % all_items;
      set_curr_idx(new_idx);
      set_banner_title_out(false);
      set_carousel_start_idx(new_idx);
    }, MAIN_BANNER_SLIDE_DURATION);

    return () => {
      clearTimeout(exit_timer);
      clearTimeout(timeout);
    };
  }, [curr_idx, all_items, slider_stop]);

  if (all_items === 0) return null;

  const THUMBNAIL_WIDTH_PLUS_MARGIN = 140;

  return (
    <div
      className="relative h-[50dvh] w-full rounded-[2rem] overflow-hidden group bg-neutral-950 shadow-2xl"
      onMouseEnter={() => set_slider_stop(true)}
      onMouseLeave={() => set_slider_stop(false)}
    >
      {/* 배경 레이어 */}
      <div className="absolute inset-0 z-0">
        {/* show_live가 true이고 토큰이 있을 때만 영상 실행 */}
        {show_live && guestToken ? (
          <LiveKitRoom
            video={true}
            token={guestToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
            className="h-full"
          >
            <BannerVideo user_id={curr_items?.user_id} token={guestToken} />
          </LiveKitRoom>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
            style={{
              backgroundImage: `url(${curr_items.thumb_url})`,
              filter: "brightness(0.8)",
            }}
          />
        )}
        {/* 가독성을 위한 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-[1]" />
      </div>

      {/* 콘텐츠 레이어 */}
      <div className="relative z-10 flex flex-col justify-center h-full w-full p-12 pb-32 text-white">
        <div
          className={`transition-all duration-700 ease-out ${bannerTitleTrans}`}
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center bg-red-600 px-3 py-1.5 rounded-full shadow-lg border border-red-500/50">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-[11px] font-black tracking-widest">
                LIVE
              </span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold">
              <Users size={14} className="mr-2" />
              {curr_items.score.toLocaleString()} 명 시청 중
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] max-w-2xl mb-10 drop-shadow-2xl">
            {curr_items.title}
          </h1>
          <span
            className="w-8 h-8
          overflow-hidden
            "
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
              className="h-8 w-8 rounded-full
              bg-white"
            />
          </span>
        </div>
      </div>

      {/* 하단 캐러셀 */}
      <div className="absolute bottom-10 left-12 right-12 z-20 overflow-hidden">
        <div
          className="flex space-x-4 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${carousel_start_idx * THUMBNAIL_WIDTH_PLUS_MARGIN}px)`,
          }}
        >
          {SLIDER_ITEMS.map((item, idx) => (
            <div
              key={item.user_id}
              onClick={() => set_curr_idx(idx)}
              className={`relative w-32 aspect-video flex-shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all duration-500 border-2 ${
                idx === curr_idx
                  ? "border-white scale-105 opacity-100"
                  : "border-transparent opacity-40 hover:opacity-80"
              }`}
            >
              <img
                src={item.thumb_url}
                className="w-full h-full object-cover"
                alt=""
              />
              {idx === curr_idx && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                  <div
                    className="h-full bg-white animate-slide-progress"
                    style={{
                      animationDuration: `${MAIN_BANNER_SLIDE_DURATION}ms`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
