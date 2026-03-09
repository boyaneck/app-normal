"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveItem {
  id: string;
  host: string;
  title: string;
  category: string;
  viewerCount: number;
}

const LiveRecommendCard = (list: LiveItem[]) => {
  const [loaded, setLoaded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showClose, setShowClose] = useState(false);

  // 전체화면 되면 10초 타이머 시작
  useEffect(() => {
    if (!expandedId) return;

    const timer = setTimeout(() => {
      setExpandedId(null);
      setShowClose(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [expandedId]);
  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const displayList = list.slice(0, 7);

  const expandedIndex = displayList.findIndex((l) => l.id === expandedId);

  const handleClick = (id: string) => {
    if (hoveredId === id) {
      setExpandedId(id);
      setHoveredId(null);
    }
  };

  const closeExpanded = () => {
    setExpandedId(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 전체화면 모드 */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            className="absolute inset-0 z-50 bg-black rounded-lg overflow-hidden"
            initial={{ scale: 0.4, opacity: 0, borderRadius: "12px" }}
            animate={{ scale: 1, opacity: 1, borderRadius: "12px" }}
            exit={{ scale: 0.4, opacity: 0, borderRadius: "12px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
            />

            {/* 닫기 버튼 */}
            {showClose && (
              <button
                onClick={closeExpanded}
                className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-sm 
                         w-7 h-7 rounded-full flex items-center justify-center
                         text-white/70 hover:text-white text-sm
                         transition-colors duration-200"
              >
                ✕
              </button>
            )}
            {/* 하단 정보 */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 
                         bg-gradient-to-t from-black/80 to-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {(() => {
                const live = displayList.find((l) => l.id === expandedId);
                if (!live) return null;
                return (
                  <>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-bold text-white">
                        LIVE
                      </span>
                      <span className="text-[10px] text-white/70">
                        {live.viewerCount}명 시청 중
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white m-0">
                      {live.title}
                    </p>
                    <p className="text-xs text-white/50 m-0 mt-1">
                      {live.host} · {live.category}
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 목록 */}
      <div className="w-full h-full overflow-y-auto flex flex-col gap-1 p-2">
        {displayList.map((live, i) => {
          const isHovered = hoveredId === live.id;
          const isExpanding = expandedId !== null;

          // 확장된 아이템 기준으로 위/아래 판단
          let slideDirection = 0;
          if (isExpanding && expandedId !== live.id) {
            slideDirection = i < expandedIndex ? -1 : 1;
          }

          return (
            <motion.div
              key={live.id}
              onMouseEnter={() => {
                if (!expandedId) setHoveredId(live.id);
                setShowClose(true);
              }}
              onMouseLeave={() => {
                if (!expandedId) setHoveredId(null);
                setShowClose(false);
              }}
              onClick={() => handleClick(live.id)}
              className="h-[100px] flex relative cursor-pointer rounded-lg overflow-hidden flex-shrink-0"
              animate={{
                opacity:
                  isExpanding && expandedId !== live.id ? 0 : loaded ? 1 : 0,
                y:
                  isExpanding && expandedId !== live.id
                    ? slideDirection * 150
                    : loaded
                      ? 0
                      : 8,
              }}
              transition={{
                duration: isExpanding ? 0.5 : 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: isExpanding ? 0 : i * 0.03,
              }}
            >
              {/* 썸네일/영상 영역 */}
              <div
                className="h-full flex-shrink-0 relative overflow-hidden rounded-lg"
                style={{
                  width: isHovered ? "100%" : "45%",
                  transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* 썸네일 이미지 */}
                <img
                  src={`https://picsum.photos/seed/${live.id}/400/250`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: isHovered ? 0 : 1,
                    transition: "opacity 0.6s ease",
                  }}
                />

                {/* 라이브 영상 */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 0.6s ease",
                  }}
                  src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"
                />

                {/* LIVE 뱃지 */}
                <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                  <span className="bg-red-600/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-white tracking-wide">
                    LIVE
                  </span>
                  <span className="bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] text-white font-medium">
                    {live.viewerCount}명
                  </span>
                </div>
              </div>

              {/* 정보 영역 */}
              <div
                className="flex-1 px-3 flex flex-col justify-center gap-1 min-w-0 overflow-hidden"
                style={{
                  opacity: isHovered ? 0 : 1,
                  transform: isHovered ? "translateX(30px)" : "translateX(0)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <p className="text-[13px] font-semibold text-gray-900 m-0 truncate leading-tight">
                  {live.title}
                </p>
                <p className="text-xs text-gray-400 m-0">{live.host}</p>
                <p className="text-[11px] text-gray-300 m-0">
                  {live.category}
                  <span className="mx-1">·</span>
                  시청자 {live.viewerCount}명
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveRecommendCard;
