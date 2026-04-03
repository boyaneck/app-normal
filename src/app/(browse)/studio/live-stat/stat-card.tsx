"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  unit: string;
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

// ===== hover 시 색상 =====
const HOVER_COLORS = [
  "hover:border-blue-300/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15),_0_2px_8px_rgba(59,130,246,0.1)]",
  "hover:border-violet-300/50 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15),_0_2px_8px_rgba(139,92,246,0.1)]",
  "hover:border-emerald-300/50 hover:shadow-[0_8px_32px_rgba(52,211,153,0.15),_0_2px_8px_rgba(52,211,153,0.1)]",
  "hover:border-amber-300/50 hover:shadow-[0_8px_32px_rgba(251,191,36,0.15),_0_2px_8px_rgba(251,191,36,0.1)]",
  "hover:border-rose-300/50 hover:shadow-[0_8px_32px_rgba(251,113,133,0.15),_0_2px_8px_rgba(251,113,133,0.1)]",
];

const StatCard = ({
  title,
  value,
  unit,
  isChartHovered,
  index,
  onHover,
  onClick,
}: StatCardProps) => {
  const animatedValue = useCountUp(value, 500);
  const hoverColor = HOVER_COLORS[index % HOVER_COLORS.length];

  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      className={`
        relative flex-1 min-w-[155px] rounded-2xl p-5
        bg-white/90
        backdrop-blur-xl
        border border-white
        shadow-[0_1px_12px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        hover:-translate-y-1
        cursor-default overflow-hidden
        ${hoverColor}
      `}
    >
      {/* 글래스 반사 */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />

      <h3 className="text-[10px] uppercase tracking-[0.15em] text-black/30 font-medium mb-3">
        {title}
      </h3>

      <div className="text-[28px] font-semibold text-black/85 tracking-tight leading-none mb-2 tabular-nums">
        {animatedValue.toLocaleString()}
      </div>

      <span className="text-[11px] text-black/25 font-medium">{unit}</span>
    </div>
  );
};

export default StatCard;
