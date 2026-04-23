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

const toSeconds = (ts: string): number => {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
};

interface Props {
  cardTitle?: string;
  clips?: Clip[];
}

export const LiveHighlightClip = ({ cardTitle, clips = MOCK_CLIPS }: Props) => {
  const [activeClip, setActiveClip] = useState<Clip>(clips[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  const totalSec =
    clips.length > 0 ? toSeconds(clips[clips.length - 1].timestamp) * 1.2 : 3600;

  const getPos = (ts: string) =>
    Math.min((toSeconds(ts) / totalSec) * 100, 93);

  const handleSelect = (clip: Clip) => {
    setActiveClip(clip);
    if (mainVideoRef.current && clip.src) {
      mainVideoRef.current.src = clip.src;
      mainVideoRef.current.play().catch(() => {});
    }
  };

  const getPopupAlign = (pos: number) => {
    if (pos < 18) return { left: 0, transform: "none" };
    if (pos > 80) return { right: 0, left: "auto" as const, transform: "none" };
    return { left: "50%", transform: "translateX(-50%)" };
  };

  return (
    // h-full 추가 — AI 채팅 패널과 높이 맞춤
    <div
      className="flex flex-col rounded-2xl w-full h-full"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "rgba(239,68,68,0.9)", boxShadow: "0 0 6px rgba(239,68,68,0.5)" }}
        />
        <span className="text-[11px] text-white/45 tracking-wide">
          {cardTitle ? `${cardTitle} ` : ""}하이라이트 클립
        </span>
        <span
          className="ml-auto text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.25)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          {clips.length}개
        </span>
      </div>

      {/* 메인 플레이어 — flex-1로 남은 공간 채움 */}
      <div className="flex-1 min-h-0 px-4 pt-4 pb-3">
        <div
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <AnimatePresence mode="wait">
            {activeClip.src ? (
              <motion.video
                key={activeClip.id}
                ref={mainVideoRef}
                src={activeClip.src}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                loop muted playsInline autoPlay
              />
            ) : (
              <motion.div
                key={`ph-${activeClip.id}`}
                className="w-full h-full flex flex-col items-center justify-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "0.5px solid rgba(255,255,255,0.13)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <p className="text-[11px] text-white/35">{activeClip.label}</p>
                <p className="text-[10px] text-white/20 tabular-nums">{activeClip.timestamp}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 타임라인 섹션 */}
      <div className="flex-shrink-0 px-5 pb-6">
        <p className="text-[9px] text-white/45 mb-4 tracking-widest uppercase font-medium">
          Timeline
        </p>

        {/* 라인 + 점 — overflow visible 유지 (팝업이 위로 뜨도록) */}
        <div
          className="relative w-full"
          style={{ height: 20, overflow: "visible" }}
        >
          {/* ── 베이스 라인 ── */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              marginTop: -1,
              borderRadius: 999,
              background: "rgba(255,255,255,0.22)",
            }}
          />

          {/* ── 활성 구간 (보라) ── */}
          <motion.div
            animate={{ width: `${getPos(activeClip.timestamp)}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              height: 2,
              marginTop: -1,
              borderRadius: 999,
              background: "linear-gradient(to right, #7c6aff, #a78bfa)",
            }}
          />

          {/* ── 마커 점 + 팝업 ── */}
          {clips.map((clip) => {
            const pos = getPos(clip.timestamp);
            const isActive = activeClip.id === clip.id;
            const isHovered = hoveredId === clip.id;
            const popupAlign = getPopupAlign(pos);

            return (
              <div
                key={clip.id}
                style={{
                  position: "absolute",
                  left: `${pos}%`,
                  top: "50%",
                  width: 28,
                  height: 28,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: isHovered ? 30 : 10,
                }}
                onMouseEnter={() => setHoveredId(clip.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleSelect(clip)}
              >
                {/* 팝업 미리보기 — 점 위로 직접 떠오름 */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        width: 140,
                        zIndex: 50,
                        ...popupAlign,
                      }}
                      initial={{ opacity: 0, y: 8, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.92 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "rgba(10,10,22,0.94)",
                          border: "0.5px solid rgba(255,255,255,0.18)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        {/* 영상/썸네일 */}
                        <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "rgba(30,30,50,0.8)" }}>
                          {clip.src ? (
                            <video src={clip.src} className="w-full h-full object-cover" muted playsInline autoPlay loop />
                          ) : clip.thumbnail ? (
                            <img src={clip.thumbnail} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)" stroke="none">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* 정보 */}
                        <div
                          className="flex items-center justify-between gap-2 px-2.5 py-2"
                          style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
                        >
                          <span className="text-[9px] font-semibold text-white/85 tabular-nums">
                            {clip.timestamp}
                          </span>
                          <span className="text-[8px] text-white/35 truncate max-w-[72px]">
                            {clip.label}
                          </span>
                        </div>
                      </div>
                      {/* 화살표 */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -5,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 0, height: 0,
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: "5px solid rgba(10,10,22,0.94)",
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 점 */}
                <motion.div
                  animate={{
                    width: isActive ? 13 : isHovered ? 11 : 8,
                    height: isActive ? 13 : isHovered ? 11 : 8,
                    background: isActive
                      ? "#a78bfa"
                      : isHovered
                        ? "#fff"
                        : "rgba(255,255,255,0.55)",
                    boxShadow: isActive
                      ? "0 0 0 3px rgba(167,139,250,0.3), 0 0 14px rgba(124,106,255,0.6)"
                      : isHovered
                        ? "0 0 0 2px rgba(255,255,255,0.2)"
                        : "none",
                  }}
                  transition={{ duration: 0.15 }}
                  style={{ borderRadius: 999 }}
                />
              </div>
            );
          })}
        </div>

        {/* 시작 / 끝 라벨 */}
        <div className="flex justify-between mt-3">
          <span className="text-[9px] text-white/30 tabular-nums">0:00</span>
          <span className="text-[9px] text-white/30 tabular-nums">
            {clips[clips.length - 1]?.timestamp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveHighlightClip;
