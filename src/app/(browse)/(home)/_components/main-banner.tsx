import React, { useEffect, useMemo, useState } from "react";
import { useViewerToken } from "@/hooks/useViewerToken";
import { MAIN_BANNER_SLIDE_DURATION } from "@/utils/main_banner";
import { LiveKitRoom } from "@livekit/components-react";
import { Users } from "lucide-react";
import BannerVideo from "./banner_video";
import { motion, AnimatePresence } from "framer-motion";

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

const MOCK_BANNER: banner_props[] = [
  {
    score: 24800,
    thumb_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&q=80",
    title: "🎮 오늘도 즐겁게 게임 방송 중!",
    user_id: "mock_user_1",
  },
  {
    score: 18300,
    thumb_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1280&q=80",
    title: "🎵 새벽 감성 음악 라이브",
    user_id: "mock_user_2",
  },
  {
    score: 13100,
    thumb_url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1280&q=80",
    title: "🏆 랭크 도전! 다이아 가즈아",
    user_id: "mock_user_3",
  },
  {
    score: 9700,
    thumb_url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=1280&q=80",
    title: "🎨 그림 그리기 방송 — 오늘은 캐릭터 디자인",
    user_id: "mock_user_4",
  },
  {
    score: 7200,
    thumb_url: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=1280&q=80",
    title: "🎤 노래방송 — 신청곡 받아요",
    user_id: "mock_user_5",
  },
  {
    score: 4500,
    thumb_url: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1280&q=80",
    title: "🍜 먹방 라이브 — 오늘은 라멘",
    user_id: "mock_user_6",
  },
  {
    score: 2100,
    thumb_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1280&q=80",
    title: "💬 심야 토크 방송",
    user_id: "mock_user_7",
  },
];

const MainBanner = ({ live_list_now, tokenResults }: banner_obj_props) => {
  const [curr_idx, set_curr_idx] = useState<number>(0);
  const [slider_stop, set_slider_stop] = useState<boolean>(false);
  const [banner_title_in, set_banner_title_in] = useState<boolean>(true);
  const [banner_title_out, set_banner_title_out] = useState<boolean>(false);

  // 0.5초 뒤 영상 전환을 위한 상태
  const [show_live, set_show_live] = useState(false);

  // TODO: Redis 연결 후 아래 줄로 교체
  // const SLIDER_ITEMS = live_list_now?.length ? live_list_now : MOCK_BANNER;
  const SLIDER_ITEMS = MOCK_BANNER;
  const curr_items = SLIDER_ITEMS[curr_idx];
  const all_items = SLIDER_ITEMS.length;

  const { token: guestToken } = useViewerToken("Guest");

  // 아이템 변경 시 타이틀 애니메이션 및 영상 전환 타이머
  useEffect(() => {
    set_show_live(false);
    set_banner_title_in(true);

    const videoTimer = setTimeout(() => set_show_live(true), 500);
    const titleTimer = setTimeout(() => set_banner_title_in(false), 100);

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
    }, MAIN_BANNER_SLIDE_DURATION);

    return () => {
      clearTimeout(exit_timer);
      clearTimeout(timeout);
    };
  }, [curr_idx, all_items, slider_stop]);

  const isMock = true; // TODO: Redis 연결 후 제거

  // 캐러셀: curr_idx 0~3 → [0,1,2,3] 4개, curr_idx 4+ → [4,5,6] 3개
  const pageGroup = curr_idx < 4 ? 0 : 1;

  const visibleThumbs = useMemo(() => {
    if (pageGroup === 0) {
      return SLIDER_ITEMS.slice(0, Math.min(4, all_items)).map((item, i) => ({ item, idx: i, pageIdx: i }));
    }
    return SLIDER_ITEMS.slice(4).map((item, i) => ({ item, idx: 4 + i, pageIdx: i }));
  }, [pageGroup, all_items]);

  if (all_items === 0) return null;

  return (
    <div
      className="relative h-[50dvh] w-full rounded-[2rem] overflow-hidden group bg-neutral-950 shadow-2xl"
      onMouseEnter={() => set_slider_stop(true)}
      onMouseLeave={() => set_slider_stop(false)}
    >
      {/* 배경 레이어 */}
      <div className="absolute inset-0 z-0">
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
      <div className="relative z-10 flex flex-col justify-center h-full w-full p-12 pb-40 text-white">
        <div className={`transition-all duration-700 ease-out ${bannerTitleTrans}`}>
          <div className="flex items-center gap-2 mb-6">
            {!isMock && (
              <div className="flex items-center bg-red-600 px-3 py-1.5 rounded-full shadow-lg border border-red-500/50">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-[11px] font-black tracking-widest">LIVE</span>
              </div>
            )}
            <div className="flex items-center bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold">
              <Users size={14} className="mr-2" />
              {curr_items.score.toLocaleString()} 명 시청 중
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1] max-w-2xl mb-6 drop-shadow-2xl">
            {curr_items.title}
          </h1>
        </div>
      </div>

      {/* 스트리머 아바타 — 캐러셀 왼쪽 선 기준 정렬 */}
      <div className="absolute bottom-[132px] left-12 z-20 flex items-center gap-2.5">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
          className="h-8 w-8 rounded-full bg-white"
          alt="streamer"
        />
        <span className="text-sm font-medium text-white/80">Sophie</span>
      </div>

      {/* 하단 캐러셀 */}
      <div className="absolute bottom-10 left-12 right-12 z-20 flex gap-4">
        <AnimatePresence mode="popLayout">
          {visibleThumbs.map(({ item, idx: itemIdx, pageIdx }) => (
            <motion.div
              key={item.user_id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.88, transition: { duration: 0.2, delay: 0 } }}
              transition={{ duration: 0.35, ease: "easeOut", delay: pageIdx * 0.09 }}
              className="flex-shrink-0"
            >
              <div
                onClick={() => set_curr_idx(itemIdx)}
                className={`relative w-32 aspect-video cursor-pointer rounded-xl overflow-hidden transition-all duration-500 border-2 ${
                  itemIdx === curr_idx
                    ? "border-white scale-105 opacity-100"
                    : "border-transparent opacity-40 hover:opacity-80"
                }`}
              >
                <img
                  src={item.thumb_url}
                  className="w-full h-full object-cover"
                  alt=""
                />
                {itemIdx === curr_idx && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                    <div
                      key={curr_idx}
                      className="h-full bg-white animate-slide-progress"
                      style={{
                        animationDuration: `${MAIN_BANNER_SLIDE_DURATION}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainBanner;
