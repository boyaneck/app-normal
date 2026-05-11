"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
  delta?: number;
  isChartHovered: boolean;
  index: number;
  onHover: (hovered: boolean) => void;
  onClick?: () => void;
}

// ===== 카운트업 훅 =====
const useCountUp = (target: number, duration: number = 500) => {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      prevRef.current = to;
    };
  }, [target, duration]);

  return display;
};

// ===== 카드별 색상 (WeeklyChart METRIC과 동일) =====
const CARD_COLORS = [
  "#38bdf8", // avgViewer     — sky blue
  "#a78bfa", // peakViewers   — lavender
  "#2dd4bf", // totalVisitors — teal
  "#e9a800", // fund          — classic gold
  "#fb7185", // intoChatRate  — rose
];

const StatCard = ({
  title,
  value,
  unit,
  delta,
  isChartHovered,
  index,
  onHover,
  onClick,
}: StatCardProps) => {
  const animatedValue = useCountUp(value, 500);
  const c = CARD_COLORS[index % CARD_COLORS.length];

  const [showAI, setShowAI] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(true);
    aiTimerRef.current = setTimeout(() => setShowAI(true), 1000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(false);
    setShowAI(false);
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const showDelta = delta !== undefined && delta !== 0;
  const isPositive = delta !== undefined && delta > 0;

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex-1 min-w-[155px] rounded-2xl px-5 py-3.5 bg-white/90 backdrop-blur-xl cursor-pointer overflow-hidden"
      style={{
        border: isHovered ? `1.5px solid ${c}bb` : "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
        transition: "border 0.2s ease",
      }}
      whileHover={{ scale: 1.02, y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {/* 글래스 반사 */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />


      {/* AI 아이콘 (1초 hover 후 등장) */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -4 }}
            transition={{ type: "spring", stiffness: 420, damping: 20 }}
            className="absolute top-2.5 right-2.5 z-20 group"
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            style={{ cursor: "pointer" }}
          >
            {/* 툴팁 — 아이콘 아래에 표시 */}
            <div
              className="absolute top-full right-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap"
              style={{
                background: "rgba(7,20,38,0.88)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(56,189,248,0.2)",
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: 10,
                color: "rgba(255,255,255,0.85)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              AI에게 물어보기
              {/* 말풍선 꼬리 — 위쪽 */}
              <div
                className="absolute bottom-full right-2.5"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderBottom: "4px solid rgba(7,20,38,0.88)",
                }}
              />
            </div>

            {/* AI 아이콘 */}
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: "white",
                border: "0.5px solid rgba(56,189,248,0.2)",
                boxShadow: "0 1px 6px rgba(14,165,233,0.12)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C11.5 6.5 9.5 9.5 2 12C9.5 14.5 11.5 17.5 12 22C12.5 17.5 14.5 14.5 22 12C14.5 9.5 12.5 6.5 12 2Z"
                  fill="#38bdf8"
                />
                <circle cx="19.5" cy="4.5" r="2.2" fill="#0ea5e9" />
              </svg>
              {/* 거울 햇빛 훑는 효과 */}
              <div
                className="animate-sweep pointer-events-none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "55%",
                  height: "100%",
                  background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.9) 50%, transparent 80%)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h3
        className="text-[10px] uppercase tracking-[0.12em] mb-2.5 transition-all duration-200"
        style={{
          fontWeight: isHovered ? 700 : 500,
          color: isHovered ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
        }}
      >
        {title}
        <span className="normal-case tracking-normal ml-1 text-black/20">({unit})</span>
      </h3>

      <div className="flex items-baseline gap-2">
        <div className="text-[26px] font-semibold text-black/85 tracking-tight leading-none tabular-nums">
          {animatedValue.toLocaleString()}
        </div>
        {showDelta && (
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: isPositive ? "#16a34a" : "#dc2626" }}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(delta!).toLocaleString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
