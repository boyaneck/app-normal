"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Clip {
  id: string;
  label: string;
  timestamp: string;
  duration: string;
  src?: string; // Supabase Storage public URL
}

const MOCK_CLIPS: Clip[] = [
  { id: "1", label: "후원 스파이크", timestamp: "14:32", duration: "0:30" },
  { id: "2", label: "최고 시청자", timestamp: "28:15", duration: "0:25" },
  { id: "3", label: "채팅 폭발", timestamp: "45:08", duration: "0:35" },
  { id: "4", label: "최다 방문", timestamp: "1:02:44", duration: "0:20" },
];

interface Props {
  cardTitle?: string;
  clips?: Clip[];
}

export const LiveHighlightClip = ({ cardTitle, clips = MOCK_CLIPS }: Props) => {
  const [activeClip, setActiveClip] = useState<Clip>(clips[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = (clip: Clip) => {
    setHoveredId(clip.id);
    setActiveClip(clip);
    if (videoRef.current) {
      if (clip.src) {
        videoRef.current.src = clip.src;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleLeave = () => {
    setHoveredId(null);
    videoRef.current?.pause();
  };

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(10,10,18,0.85)",
        backdropFilter: "blur(24px)",
        border: "0.5px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
      }}
    >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "rgba(239,68,68,0.8)",
            boxShadow: "0 0 6px rgba(239,68,68,0.5)",
          }}
        />
        <span className="text-[11px] text-white/35 tracking-wide">
          {cardTitle ? `${cardTitle} ` : ""}하이라이트 클립
        </span>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.2)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {clips.length}개
        </span>
      </div>

      {/* 메인 플레이어 */}
      <div className="flex-1 min-h-0 p-4 pb-2">
        <div
          className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}
        >
          <AnimatePresence mode="wait">
            {activeClip.src ? (
              <motion.video
                key={activeClip.id}
                ref={videoRef}
                src={activeClip.src}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                loop
                muted
                playsInline
              />
            ) : (
              <motion.div
                key={`placeholder-${activeClip.id}`}
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* 재생 아이콘 */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(124,106,255,0.12)",
                    border: "0.5px solid rgba(124,106,255,0.2)",
                  }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="rgba(124,106,255,0.7)"
                    stroke="none"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/40 font-medium">
                    {activeClip.label}
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5 tabular-nums">
                    {activeClip.timestamp} · {activeClip.duration}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 하단 오버레이 뱃지 */}
          <motion.div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{
              background: "rgba(10,10,18,0.72)",
              backdropFilter: "blur(12px)",
              border: "0.5px solid rgba(255,255,255,0.08)",
            }}
            layoutId="clip-badge"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: hoveredId
                  ? "rgba(239,68,68,0.9)"
                  : "rgba(255,255,255,0.2)",
                transition: "background 0.2s",
              }}
            />
            <span className="text-[10px] text-white/55">
              {activeClip.label}
            </span>
            <span className="text-[10px] text-white/25 tabular-nums">
              {activeClip.duration}
            </span>
          </motion.div>
        </div>
      </div>

      {/* 썸네일 스트립 */}
      <div className="flex-shrink-0 px-4 pb-4 flex gap-2">
        {clips.map((clip) => {
          const isHovered = hoveredId === clip.id;
          return (
            <motion.div
              key={clip.id}
              className="flex-1 rounded-xl overflow-hidden relative cursor-pointer"
              style={{
                background: isHovered
                  ? "rgba(124,106,255,0.12)"
                  : "rgba(255,255,255,0.03)",
                border: isHovered
                  ? "0.5px solid rgba(124,106,255,0.35)"
                  : "0.5px solid rgba(255,255,255,0.06)",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={() => handleEnter(clip)}
              onMouseLeave={handleLeave}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5 p-2.5 h-full">
                {/* 썸네일 영역 (실제 영상 프레임으로 교체 예정) */}
                <div
                  className="w-full rounded-lg flex items-center justify-center"
                  style={{
                    aspectRatio: "16/9",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <motion.div
                    animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={
                        isHovered
                          ? "rgba(124,106,255,0.8)"
                          : "rgba(255,255,255,0.2)"
                      }
                      stroke="none"
                      style={{ transition: "fill 0.2s" }}
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </motion.div>
                </div>

                <span
                  className="text-[9px] truncate w-full text-center leading-tight"
                  style={{
                    color: isHovered
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(255,255,255,0.2)",
                  }}
                >
                  {clip.label}
                </span>
                <span
                  className="text-[8px] tabular-nums"
                  style={{
                    color: isHovered
                      ? "rgba(124,106,255,0.6)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  {clip.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveHighlightClip;
