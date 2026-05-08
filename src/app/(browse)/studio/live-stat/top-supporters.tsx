"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTopSupporters } from "@/api/live";

interface Supporter {
  nickname: string;
  amount: number;
  count: number;
}

interface TopSupportersProps {
  supporters?: Supporter[];
}

const MOCK_SUPPORTERS: Supporter[] = [
  { nickname: "별빛_기사단", amount: 85000, count: 12 },
  { nickname: "새벽감성러", amount: 52000, count: 8 },
  { nickname: "고양이집사", amount: 30000, count: 5 },
  { nickname: "맛있는라면", amount: 15000, count: 3 },
  { nickname: "게임마스터99", amount: 8000, count: 2 },
];

// 1등: 골드, 2~5등: 스카이블루
const getColor = (i: number) => {
  if (i === 0) return {
    bg: "linear-gradient(135deg, rgba(255,179,0,0.12) 0%, rgba(255,120,60,0.08) 100%)",
    border: "0.5px solid rgba(255,160,40,0.28)",
    dot: "linear-gradient(135deg, #FFB300, #FF5722)",
    dotGlow: "0 0 6px rgba(255,160,40,0.5)",
    bar: "linear-gradient(90deg, #FFB300, #FF7043)",
    badge: { bg: "rgba(255,150,30,0.12)", color: "rgba(200,100,10,0.8)", text: "1st" },
  };
  return {
    bg: "rgba(56,189,248,0.07)",
    border: "0.5px solid rgba(56,189,248,0.22)",
    dot: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
    dotGlow: "0 0 6px rgba(56,189,248,0.45)",
    bar: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
    badge: null,
  };
};

const RANKS = ["1st", "2nd", "3rd", "4th", "5th"];

const TopSupporters = ({
  supporters: propSupporters,
}: TopSupportersProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data: fetchedSupporters } = useQuery({
    queryKey: ["topSupporters"],
    queryFn: getTopSupporters,
    staleTime: 1000 * 60 * 5,
  });

  const supporters = fetchedSupporters?.length
    ? fetchedSupporters
    : propSupporters ?? MOCK_SUPPORTERS;

  const maxAmount = supporters[0]?.amount ?? 1;

  return (
    <div
      className="w-full rounded-[22px] px-4 py-4 flex flex-col h-full overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-[13px] font-medium tracking-tight" style={{ color: "rgba(0,0,0,0.82)" }}>
          Top Supporters
        </h3>
        <span
          className="text-[10px] rounded-full px-2.5 py-0.5"
          style={{ color: "rgba(0,0,0,0.3)", background: "rgba(0,0,0,0.04)", border: "0.5px solid rgba(0,0,0,0.07)" }}
        >
          이번 방송
        </span>
      </div>

      {/* 리스트 */}
      <div className="flex flex-col flex-1 gap-1 min-h-0">
        {supporters.map((s, i) => {
          const pct = Math.round((s.amount / maxAmount) * 100);
          const isHovered = hoveredIndex === i;
          const c = getColor(i);

          return (
            <div
              key={s.nickname}
              className="flex items-center gap-2 cursor-default transition-all duration-200 flex-1 min-h-0 overflow-hidden"
              style={{
                padding: "6px 8px",
                borderRadius: 12,
                background: isHovered ? c.bg : "transparent",
                border: isHovered ? c.border : "0.5px solid transparent",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 순위 도트 */}
              <div
                className="shrink-0 transition-all duration-200"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isHovered ? c.dot : "rgba(0,0,0,0.15)",
                  boxShadow: isHovered ? c.dotGlow : "none",
                }}
              />

              {/* 콘텐츠 */}
              <div className="flex-1 min-w-0 overflow-hidden">
                {/* 닉네임 + 금액 */}
                <div className="flex items-baseline justify-between gap-1 mb-1">
                  <span
                    className="truncate text-[12px] transition-all duration-200 min-w-0"
                    style={{ fontWeight: isHovered ? 500 : 400, color: "rgba(0,0,0,0.82)" }}
                  >
                    {s.nickname}
                  </span>
                  <span
                    className="shrink-0 tabular-nums text-[12px] transition-all duration-200"
                    style={{ fontWeight: isHovered ? 500 : 400, color: "rgba(0,0,0,0.75)", letterSpacing: "-0.01em" }}
                  >
                    {s.amount.toLocaleString()}
                    <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(0,0,0,0.25)", marginLeft: 1 }}>원</span>
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="rounded-full mb-1" style={{ height: 2, background: "rgba(0,0,0,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: isHovered ? c.bar : "rgba(0,0,0,0.1)" }}
                  />
                </div>

                {/* 후원 횟수 + 배지 */}
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 10, color: "rgba(0,0,0,0.25)" }}>{s.count}회 후원</span>
                  {isHovered && (
                    <span
                      className="rounded"
                      style={{
                        fontSize: 9,
                        background: i === 0 ? "rgba(255,150,30,0.12)" : "rgba(56,189,248,0.12)",
                        color: i === 0 ? "rgba(200,100,10,0.8)" : "rgba(14,165,233,0.9)",
                        padding: "1px 5px",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {RANKS[i]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSupporters;
