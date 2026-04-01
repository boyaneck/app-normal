"use client";

import { useState } from "react";

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

const TopSupporters = ({
  supporters = MOCK_SUPPORTERS,
}: TopSupportersProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxAmount = supporters[0]?.amount ?? 1;

  return (
    <div
      className="w-[290px] rounded-[22px] p-5 flex flex-col h-full"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.08)",
        boxShadow:
          "0 2px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3
          className="text-[13px] font-medium tracking-tight"
          style={{ color: "rgba(0,0,0,0.82)" }}
        >
          Top Supporters
        </h3>
        <span
          className="text-[10px] rounded-full px-2.5 py-0.5"
          style={{
            color: "rgba(0,0,0,0.3)",
            background: "rgba(0,0,0,0.04)",
            border: "0.5px solid rgba(0,0,0,0.07)",
          }}
        >
          이번 방송
        </span>
      </div>

      {/* 리스트 — flex-1로 남은 높이 전부 채움 */}
      <div className="flex flex-col flex-1 gap-0.5">
        {supporters.map((s, i) => {
          const pct = Math.round((s.amount / maxAmount) * 100);
          const isTop = i === 0;
          const isTopHovered = isTop && hoveredIndex === i;

          return (
            <div
              key={s.nickname}
              className="flex items-center gap-2.5 cursor-default transition-all duration-200 flex-1"
              style={
                isTopHovered
                  ? {
                      padding: "10px 11px",
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, rgba(255,179,0,0.13) 0%, rgba(255,120,60,0.09) 100%)",
                      border: "0.5px solid rgba(255,160,40,0.3)",
                      boxShadow: "inset 0 1px 0 rgba(255,220,120,0.3)",
                    }
                  : {
                      padding: "8px 11px",
                      borderRadius: "12px",
                      border: "0.5px solid transparent",
                    }
              }
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 도트 */}
              <div
                className="shrink-0 transition-all duration-200"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isTopHovered
                    ? "linear-gradient(135deg, #FFB300, #FF5722)"
                    : "rgba(0,0,0,0.15)",
                  boxShadow: isTopHovered
                    ? "0 0 6px rgba(255,160,40,0.5)"
                    : "none",
                }}
              />

              {/* 콘텐츠 */}
              <div className="flex-1 min-w-0">
                {/* 닉네임 + 금액 */}
                <div className="flex items-baseline justify-between mb-1.5">
                  <span
                    className="truncate max-w-[140px] transition-all duration-200"
                    style={{
                      fontSize: 13,
                      fontWeight: isTopHovered ? 500 : 400,
                      color: "rgba(0,0,0,0.82)",
                    }}
                  >
                    {s.nickname}
                  </span>
                  <span
                    className="shrink-0 ml-2 tabular-nums transition-all duration-200"
                    style={{
                      fontSize: 13,
                      fontWeight: isTopHovered ? 500 : 400,
                      color: "rgba(0,0,0,0.82)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.amount.toLocaleString()}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 400,
                        color: "rgba(0,0,0,0.25)",
                        marginLeft: 1,
                      }}
                    >
                      원
                    </span>
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div
                  className="rounded-full"
                  style={{ height: 2, background: "rgba(0,0,0,0.05)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${pct}%`,
                      background: isTopHovered
                        ? "linear-gradient(90deg, #FFB300, #FF7043)"
                        : "rgba(0,0,0,0.12)",
                    }}
                  />
                </div>

                {/* 후원 횟수 + 1st 배지 */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span style={{ fontSize: 10, color: "rgba(0,0,0,0.25)" }}>
                    {s.count}회 후원
                  </span>
                  {isTopHovered && (
                    <span
                      className="rounded"
                      style={{
                        fontSize: 9,
                        background: "rgba(255,150,30,0.12)",
                        color: "rgba(200,100,10,0.8)",
                        padding: "1px 5px",
                        letterSpacing: "0.02em",
                      }}
                    >
                      1st
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
