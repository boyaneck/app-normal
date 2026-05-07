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

// ===== 카드별 glow 색상 =====
const GLOW_COLORS = [
  { hex: "#3b82f6", ai: "linear-gradient(135deg, #60a5fa, #2563eb)" }, // blue
  { hex: "#8b5cf6", ai: "linear-gradient(135deg, #a78bfa, #7c3aed)" }, // violet
  { hex: "#34d399", ai: "linear-gradient(135deg, #6ee7b7, #059669)" }, // emerald
  { hex: "#fbbf24", ai: "linear-gradient(135deg, #fcd34d, #d97706)" }, // amber
  { hex: "#fb7185", ai: "linear-gradient(135deg, #fca5a5, #dc2626)" }, // rose
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
  const glow = GLOW_COLORS[index % GLOW_COLORS.length];
  const c = glow.hex;
  const keyframeName = `statcard-glow-${index}`;

  const [showAI, setShowAI] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    onHover(true);
    aiTimerRef.current = setTimeout(() => setShowAI(true), 1000);
  };

  const handleMouseLeave = () => {
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
    <>
      {/* AICard의 animate-border-glow와 동일한 방식: CSS 키프레임을 카드 색상별로 동적 생성 */}
      <style>{`
        @keyframes ${keyframeName} {
          0%, 100% {
            box-shadow: 0 1px 12px rgba(0,0,0,0.04);
            border-color: ${c}55;
          }
          50% {
            box-shadow: 0 0 22px 8px ${c}55, 0 0 44px 18px ${c}30;
            border-color: ${c};
          }
        }
      `}</style>

      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className="relative flex-1 min-w-[155px] rounded-2xl p-5 bg-white/90 backdrop-blur-xl cursor-default overflow-hidden"
        style={
          showAI
            ? {
                border: `2px solid ${c}55`,
                boxShadow: `0 1px 12px rgba(0,0,0,0.04)`,
                animation: `${keyframeName} 2.5s ease-in-out infinite`,
              }
            : {
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
                animation: "none",
              }
        }
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ scale: { duration: 0.25 }, y: { duration: 0.25 } }}
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
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center z-10"
              style={{
                background: glow.ai,
                boxShadow: `0 2px 8px ${c}80`,
              }}
            >
              {/* AI 네트워크 그래프 아이콘 */}
              <svg width="13" height="13" viewBox="0 0 110 110" fill="none">
                <circle cx="40" cy="40" r="9" fill="white" opacity="0.95" />
                <circle cx="70" cy="40" r="9" fill="white" opacity="0.95" />
                <circle cx="55" cy="66" r="9" fill="white" opacity="0.95" />
                <line x1="40" y1="40" x2="70" y2="40" stroke="white" strokeWidth="5" opacity="0.75" />
                <line x1="40" y1="40" x2="55" y2="66" stroke="white" strokeWidth="5" opacity="0.75" />
                <line x1="70" y1="40" x2="55" y2="66" stroke="white" strokeWidth="5" opacity="0.75" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        <h3 className="text-[10px] uppercase tracking-[0.15em] text-black/30 font-medium mb-3">
          {title}
        </h3>

        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-[28px] font-semibold text-black/85 tracking-tight leading-none tabular-nums">
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

        <span className="text-[11px] text-black/25 font-medium">{unit}</span>
      </motion.div>
    </>
  );
};

export default StatCard;
