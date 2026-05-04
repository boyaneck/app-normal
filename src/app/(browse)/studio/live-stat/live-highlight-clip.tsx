"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Clip {
  id: string;
  label: string;
  timestamp: string;
  duration: string;
  src?: string;
  thumbnail?: string;
}

const MOCK_CLIPS: Clip[] = [
  { id: "1", label: "하이라이트 1", timestamp: "14:32", duration: "1:00" },
  { id: "2", label: "하이라이트 2", timestamp: "28:15", duration: "1:00" },
  { id: "3", label: "하이라이트 3", timestamp: "45:08", duration: "1:00" },
  { id: "4", label: "하이라이트 4", timestamp: "1:02:44", duration: "1:00" },
];

interface Props {
  cardTitle?: string;
  clips?: Clip[];
}

export const LiveHighlightClip = ({ cardTitle, clips = MOCK_CLIPS }: Props) => {
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const onDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - (carouselRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = carouselRef.current?.scrollLeft ?? 0;
    if (carouselRef.current) carouselRef.current.style.cursor = "grabbing";
  };

  const onDragMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    carouselRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const onDragEnd = () => {
    isDragging.current = false;
    if (carouselRef.current) carouselRef.current.style.cursor = "grab";
  };

  const handleSelect = (clip: Clip) => {
    setActiveClip((prev) => (prev?.id === clip.id ? null : clip));
    if (mainVideoRef.current && clip.src) {
      mainVideoRef.current.src = clip.src;
      mainVideoRef.current.play().catch(() => {});
    }
  };

  const displayed = activeClip ?? clips[0];

  return (
    <div className="flex flex-col w-full h-full">
      {/* 메인 플레이어 */}
      <div className="flex-1 min-h-0">
        <div className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.28)", border: "0.5px solid rgba(255,255,255,0.07)" }}
        >
          <AnimatePresence mode="wait">
            {displayed.src ? (
              <motion.video
                key={displayed.id}
                ref={mainVideoRef}
                src={displayed.src}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                loop muted playsInline autoPlay
              />
            ) : (
              <motion.div
                key={`ph-${displayed.id}`}
                className="w-full h-full flex flex-col items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <p className="text-[9px] text-white/25 tabular-nums">{displayed.timestamp}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 라벨 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
          >
            <p className="text-[10px] text-white/70 truncate">{displayed.label}</p>
            <p className="text-[9px] text-white/35 tabular-nums">{displayed.timestamp}</p>
          </div>
        </div>
      </div>

      {/* 하단 썸네일 캐러셀 */}
      <div className="flex-shrink-0 pt-2 relative">
        {/* 오른쪽 더 있음 힌트 */}
        {clips.length > 4 && (
          <div
            className="absolute right-0 top-2 bottom-1 w-8 pointer-events-none z-10"
            style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.7))" }}
          >
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
              <div className="w-0.5 h-0.5 rounded-full bg-white/40" />
              <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
              <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
            </div>
          </div>
        )}
        <div
          ref={carouselRef}
          className="flex gap-1.5 overflow-x-auto pb-1 select-none"
          style={{ scrollbarWidth: "none", cursor: "grab" }}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >
          {clips.map((clip) => {
            const isActive = activeClip?.id === clip.id;
            return (
              <motion.button
                key={clip.id}
                onClick={() => handleSelect(clip)}
                whileTap={{ scale: 0.95 }}
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  width: "calc(25% - 5px)",
                  minWidth: "calc(25% - 5px)",
                  aspectRatio: "16/10",
                  borderRadius: 8,
                  border: isActive
                    ? "1.5px solid rgba(167,139,250,0.9)"
                    : "0.5px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.3)",
                  boxShadow: isActive ? "0 0 8px rgba(124,106,255,0.4)" : "none",
                }}
              >
                {clip.thumbnail ? (
                  <img src={clip.thumbnail} className="w-full h-full object-cover" alt="" />
                ) : clip.src ? (
                  <video src={clip.src} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24"
                      fill={isActive ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.2)"}
                      stroke="none"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: "linear-gradient(to right, #7c6aff, #a78bfa)" }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveHighlightClip;
