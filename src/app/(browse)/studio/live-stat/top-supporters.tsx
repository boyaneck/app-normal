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

const RANK_STYLE = [
  { num: "#f59e0b", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)" },
  { num: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  { num: "#b45309", bg: "rgba(180,83,9,0.08)",    border: "rgba(180,83,9,0.18)" },
  { num: "#38bdf8", bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.18)" },
  { num: "#38bdf8", bg: "rgba(56,189,248,0.07)",  border: "rgba(56,189,248,0.18)" },
];

const TopSupporters = ({ supporters: propSupporters }: TopSupportersProps) => {
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
      className="w-full rounded-[22px] px-5 py-4 flex flex-col h-full overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-[13px] font-semibold tracking-tight" style={{ color: "rgba(0,0,0,0.8)" }}>
          Top Supporters
        </h3>
        <span
          className="text-[10px] font-medium rounded-full px-2.5 py-0.5"
          style={{
            color: "rgba(0,0,0,0.55)",
            background: "rgba(0,0,0,0.06)",
            border: "0.5px solid rgba(0,0,0,0.1)",
          }}
        >
          이번 방송
        </span>
      </div>

      {/* 리스트 */}
      <div className="flex flex-col flex-1 gap-0.5 min-h-0">
        {supporters.map((s, i) => {
          const pct = Math.round((s.amount / maxAmount) * 100);
          const isHovered = hoveredIndex === i;
          const rs = RANK_STYLE[i] ?? RANK_STYLE[4];

          return (
            <div
              key={s.nickname}
              className="flex items-center gap-3 flex-1 min-h-0 rounded-xl transition-all duration-200"
              style={{
                padding: "6px 8px",
                background: isHovered ? rs.bg : "transparent",
                border: isHovered ? `0.5px solid ${rs.border}` : "0.5px solid transparent",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 순위 번호 */}
              <span
                className="shrink-0 text-[11px] font-bold tabular-nums w-4 text-center transition-all duration-200"
                style={{ color: isHovered ? rs.num : "rgba(0,0,0,0.2)" }}
              >
                {i + 1}
              </span>

              {/* 닉네임 + 바 */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className="truncate text-[12px] min-w-0 transition-all duration-200"
                    style={{
                      fontWeight: isHovered ? 600 : 400,
                      color: isHovered ? "rgba(0,0,0,0.82)" : "rgba(0,0,0,0.6)",
                    }}
                  >
                    {s.nickname}
                  </span>
                  <span
                    className="shrink-0 tabular-nums text-[12px] transition-all duration-200"
                    style={{
                      fontWeight: isHovered ? 600 : 400,
                      color: isHovered ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.4)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.amount >= 10000
                      ? `${(s.amount / 10000).toFixed(0)}만`
                      : s.amount.toLocaleString()}
                    <span style={{ fontSize: 9, fontWeight: 400, color: "rgba(0,0,0,0.25)", marginLeft: 1 }}>원</span>
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="rounded-full overflow-hidden" style={{ height: 2, background: "rgba(0,0,0,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isHovered
                        ? i === 0
                          ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                          : "linear-gradient(90deg, #38bdf8, #7dd3fc)"
                        : "rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
              </div>

              {/* 후원 횟수 */}
              <span
                className="shrink-0 text-[10px] tabular-nums transition-all duration-200"
                style={{ color: isHovered ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.18)" }}
              >
                {s.count}회
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSupporters;
