"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Clip {
  id: string;
  label: string;
  timestamp: string;
  duration: string;
  src?: string;
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
  const [activeClip, setActiveClip] = useState<Clip>(clips[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = (clip: Clip) => {
    setHoveredId(clip.id);
    setActiveClip(clip);
    if (videoRef.current && clip.src) {
      videoRef.current.src = clip.src;
      videoRef.current.play().catch(() => {});
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
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "0.5px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "rgba(239,68,68,0.9)",
            boxShadow: "0 0 6px rgba(239,68,68,0.6)",
          }}
        />
        <span className="text-[11px] text-white/50 tracking-wide">
          {cardTitle ? `${cardTitle} ` : ""}하이라이트 클립
        </span>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.3)",
            border: "0.5px solid rgba(255,255,255,0.1)",
          }}
        >
          {clips.length}개
        </span>
      </div>

      {/* 메인 플레이어 — 유리 위에 영상이 떠있는 느낌 */}
      <div className="flex-1 min-h-0 p-4 pb-2">
        <div
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px rgba(0,0,0,0.2)",
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
                transition={{ duration: 0.25 }}
                loop
                muted
                playsInline
              />
            ) : (
              <motion.div
                key={`placeholder-${activeClip.id}`}
                className="w-full h-full flex flex-col items-center justify-center gap-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                {/* 재생 아이콘 — 유리 느낌 */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                    border: "0.5px solid rgba(255,255,255,0.15)",
                    boxShadow:
                      "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.6)"
                    stroke="none"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>

                <div className="text-center">
                  <p className="text-xs text-white/50 font-medium">
                    {activeClip.label}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5 tabular-nums">
                    {activeClip.timestamp}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 하단 오버레이 — 유리 배지 */}
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: hoveredId
                  ? "rgba(239,68,68,0.9)"
                  : "rgba(255,255,255,0.3)",
                transition: "background 0.2s",
                boxShadow: hoveredId ? "0 0 4px rgba(239,68,68,0.5)" : "none",
              }}
            />
            <span className="text-[10px] text-white/60">
              {activeClip.timestamp}
            </span>
          </div>
        </div>
      </div>

      {/* 썸네일 스트립 — 타입 레이블 없이 순서만 */}
      <div className="flex-shrink-0 px-4 pb-4 flex gap-2">
        {clips.map((clip, idx) => {
          const isActive = activeClip.id === clip.id;
          const isHovered = hoveredId === clip.id;
          return (
            <motion.div
              key={clip.id}
              className="flex-1 rounded-xl overflow-hidden relative cursor-pointer"
              style={{
                background:
                  isActive || isHovered
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
                border:
                  isActive || isHovered
                    ? "0.5px solid rgba(255,255,255,0.2)"
                    : "0.5px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  isActive || isHovered
                    ? "inset 0 1px 0 rgba(255,255,255,0.12)"
                    : "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={() => handleEnter(clip)}
              onMouseLeave={handleLeave}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5 p-2.5">
                {/* 썸네일 영역 */}
                <div
                  className="w-full rounded-lg flex items-center justify-center"
                  style={{
                    aspectRatio: "16/9",
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <motion.div
                    animate={isHovered || isActive ? { scale: 1.2 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill={
                        isHovered || isActive
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(255,255,255,0.2)"
                      }
                      stroke="none"
                      style={{ transition: "fill 0.2s" }}
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </motion.div>
                </div>

                {/* 순서 번호만 표시 */}
                <span
                  className="text-[9px] tabular-nums"
                  style={{
                    color:
                      isHovered || isActive
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.2)",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
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
