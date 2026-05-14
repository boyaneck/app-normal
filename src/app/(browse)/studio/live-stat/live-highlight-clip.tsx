"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getHighlights } from "@/api/live";

export interface Clip {
  id: string;
  label: string;
  timestamp: string;
  duration: string;
  src?: string;
  thumbnail?: string;
}

interface Props {
  cardTitle?: string;
  roomName?: string;
}

export const LiveHighlightClip = ({ cardTitle, roomName }: Props) => {
  const [activeClip, setActiveClip] = useState<any | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const { data: highlights = [], isLoading } = useQuery({
    queryKey: ["highlights", roomName],
    queryFn: () => getHighlights(roomName),
    enabled: !!roomName,
    staleTime: 1000 * 60 * 5,
  });

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

  const handleSelect = (clip: any) => {
    setActiveClip((prev: any) => (prev?.id === clip.id ? null : clip));
    if (mainVideoRef.current && clip.public_url) {
      mainVideoRef.current.src = clip.public_url;
      mainVideoRef.current.play().catch(() => {});
    }
  };

  const displayed = activeClip ?? highlights[0];

  const formatTimestamp = (ts: string) => {
    if (!ts) return "";
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div
        className="flex flex-col w-full h-full items-center justify-center gap-2 rounded-2xl"
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "0.5px solid rgba(255,255,255,0.08)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        <p className="text-[10px] text-white/50">방송 종료 후 하이라이트가 생성됩니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* 메인 플레이어 */}
      <div className="flex-1 min-h-0">
        <div className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{ background: "rgba(0,0,0,0.28)", border: "0.5px solid rgba(255,255,255,0.07)" }}
        >
          <AnimatePresence mode="wait">
            {displayed?.public_url ? (
              <motion.video
                key={displayed.id}
                ref={mainVideoRef}
                src={displayed.public_url}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                loop muted playsInline autoPlay
              />
            ) : (
              <motion.div
                key={`ph-${displayed?.id}`}
                className="w-full h-full flex flex-col items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <p className="text-[9px] text-white/25 tabular-nums">
                  {formatTimestamp(displayed?.highlight_started_at)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 라벨 오버레이 */}
          {displayed && (
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }}
            >
              <p className="text-[10px] text-white/70 truncate">{displayed.type}</p>
              <p className="text-[9px] text-white/35 tabular-nums">
                {formatTimestamp(displayed.highlight_started_at)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 썸네일 캐러셀 */}
      <div className="flex-shrink-0 pt-2 relative">
        {highlights.length > 4 && (
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
          {highlights.map((clip: any) => {
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
                {clip.public_url ? (
                  <video src={clip.public_url} className="w-full h-full object-cover" muted playsInline />
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
