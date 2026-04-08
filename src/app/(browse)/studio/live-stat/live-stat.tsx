"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "./stat-card";
import WeeklyChart from "./weekly-chart";
import TopSupporters from "./top-supporters";
import RetentionRate from "./retantion-rate";
import { useQuery } from "@tanstack/react-query";
import { getLiveStatsWeek } from "@/api/live";
import { PostLiveStats, ChatMessage } from "@/types/live";
import ClipPanel from "./live-highlight-clip";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const STAT_FIELDS = [
  {
    key: "avg_viewer" as const,
    title: "평균 시청자",
    unit: "명",
    toNumber: (v: string | number) => Math.round(parseFloat(String(v)) || 0),
  },
  {
    key: "peak_viewers" as const,
    title: "최고 시청자",
    unit: "명",
    toNumber: (v: string | number) => Number(v) || 0,
  },
  {
    key: "total_visitors" as const,
    title: "총 방문자",
    unit: "명",
    toNumber: (v: string | number) => Number(v) || 0,
  },
  {
    key: "fund" as const,
    title: "후원 금액",
    unit: "원",
    toNumber: (v: string | number) => Math.round(parseFloat(String(v)) || 0),
  },
  {
    key: "into_chat_rate" as const,
    title: "채팅 전환율",
    unit: "%",
    toNumber: (v: string | number) => parseFloat(String(v)) || 0,
  },
] as const;

export interface MiniCardInfo {
  index: number;
  title: string;
  value: number;
  unit: string;
}

const getErrorMessage = (error: unknown): { title: string; desc: string } => {
  if (error instanceof Error) {
    if (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("Failed")
    ) {
      return {
        title: "네트워크 오류",
        desc: "인터넷 연결을 확인한 후 다시 시도해주세요.",
      };
    }
    if (error.message.includes("JWT") || error.message.includes("auth")) {
      return {
        title: "인증 오류",
        desc: "세션이 만료되었습니다. 다시 로그인해주세요.",
      };
    }
    return { title: "데이터 로드 실패", desc: error.message };
  }
  return { title: "알 수 없는 오류", desc: "잠시 후 다시 시도해주세요." };
};

const StatCardSkeleton = () => (
  <div className="flex flex-row gap-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex-1 min-w-[155px] rounded-2xl p-5 bg-white/10 animate-pulse h-[110px]"
      />
    ))}
  </div>
);

interface Props {
  roomName: string | undefined;
}

const LiveStats = ({
  roomName,
  selectedCardIndex,
  onCardSelect,
  messages,
}: Props) => {
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(
    null,
  );
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  // 새 메시지 올 때 자동 스크롤 — 반드시 최상단에 선언
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const {
    data: rawStats,
    isError,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<any[] | null, Error>({
    queryKey: ["liveStatsWeek", roomName],
    queryFn: () => getLiveStatsWeek(roomName),
    enabled: !!roomName,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
    staleTime: 1000 * 60 * 5,
  });

  const liveStatsWeek: PostLiveStats[] | null = useMemo(() => {
    if (!rawStats) return null;
    return rawStats.map((item: Record<string, any>) => ({
      roomName: item.room_name,
      startedAt: item.started_at,
      dayLabel: item.started_at
        ? DAY_LABELS[new Date(item.started_at).getDay()]
        : "-",
      totalVisitors: item.total_visitors,
      avgViewer: item.avg_viewer,
      peakViewers: item.peak_viewers,
      fund: item.fund,
      intoChatRate: item.into_chat_rate,
      retentionRate: item.retention_rate,
    }));
  }, [rawStats]);

  const currentData = useMemo(() => {
    if (!liveStatsWeek?.length) return null;
    return liveStatsWeek[hoveredChartIndex ?? 0] ?? liveStatsWeek[0];
  }, [liveStatsWeek, hoveredChartIndex]);

  const highlightedKey = useMemo(() => {
    if (hoveredCardIndex === null) return null;
    return STAT_FIELDS[hoveredCardIndex]?.key ?? null;
  }, [hoveredCardIndex]);

  const latestData = liveStatsWeek?.[0] ?? null;
  const prevData = liveStatsWeek?.[1] ?? null;

  // 전체 카드 데이터 (미니 카드용)
  const allCardsData: MiniCardInfo[] = useMemo(
    () =>
      STAT_FIELDS.map((f, i) => ({
        index: i,
        title: f.title,
        unit: f.unit,
        value: currentData
          ? f.toNumber(currentData[f.key] as string | number)
          : 0,
      })),
    [currentData],
  );

  const handleCardClick = (index: number) => {
    if (selectedCardIndex === index) {
      onCardSelect(null, []);
    } else {
      onCardSelect(index, allCardsData);
    }
  };

  if (!roomName) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-white/30">
        <span className="text-sm">
          로그인 후 방송 통계를 확인할 수 있습니다.
        </span>
      </div>
    );
  }

  // ----- 로딩 -----
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <StatCardSkeleton />
        <div className="rounded-2xl bg-white/[0.05] animate-pulse h-[300px]" />
      </div>
    );
  }

  // ----- 에러 -----
  if (isError) {
    const { title, desc } = getErrorMessage(error);
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="rounded-2xl bg-red-500/10 border border-red-400/20 px-8 py-6 text-center max-w-sm">
          <p className="text-red-400 font-semibold text-sm mb-1">{title}</p>
          <p className="text-white/40 text-xs mb-4">{desc}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {isFetching ? "재시도 중..." : "다시 시도"}
          </button>
        </div>
      </div>
    );
  }

  // ----- 데이터 없음 -----
  if (!liveStatsWeek || liveStatsWeek.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-white/30">
        <span className="text-sm">아직 방송 기록이 없습니다.</span>
        <span className="text-xs">방송 종료 후 통계가 여기에 표시됩니다.</span>
      </div>
    );
  }

  const selectedField =
    selectedCardIndex !== null ? STAT_FIELDS[selectedCardIndex] : null;
  const selectedValue =
    selectedField && currentData
      ? selectedField.toNumber(
          currentData[selectedField.key] as string | number,
        )
      : 0;

  return (
    <div className="space-y-4 p-6">
      <AnimatePresence mode="wait">
        {selectedCardIndex !== null ? (
          /* ===== AI 채팅 뷰 (2분할) ===== */
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-row gap-3"
            style={{ height: "calc(100vh - 220px)" }}
          >
            {/* ===== 왼쪽: 클립 패널 (1/2) ===== */}
            <div className="w-1/2 h-full">
              <ClipPanel cardTitle={selectedField?.title} />
            </div>

            {/* ===== 오른쪽: AI 채팅 (1/2) ===== */}
            <div
              className="w-1/2 h-full flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,10,18,0.85)",
                backdropFilter: "blur(24px)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
              }}
            >
              {/* 헤더 */}
              <div
                className="flex-shrink-0 flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  onClick={() => onCardSelect(null, [])}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  ←
                </button>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c6aff, #5b4adf)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-white/35 tracking-wide">
                    {selectedField?.title} 분석
                  </p>
                  <p className="text-[15px] font-semibold text-white/90 leading-tight tabular-nums">
                    {selectedValue.toLocaleString()}
                    <span className="text-[11px] font-normal text-white/30 ml-1">
                      {selectedField?.unit}
                    </span>
                  </p>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div
                className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                style={{ paddingBottom: "24px" }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* AI 아바타 */}
                      {msg.role === "ai" && (
                        <div
                          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mb-0.5"
                          style={{
                            background:
                              "linear-gradient(135deg, #7c6aff40, #5b4adf40)",
                            border: "0.5px solid rgba(124,106,255,0.3)",
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="rgba(124,106,255,0.9)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        </div>
                      )}

                      {/* 말풍선 */}
                      <div
                        className="max-w-[75%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                        style={
                          msg.role === "user"
                            ? {
                                background:
                                  "linear-gradient(135deg, #7c6aff, #5b4adf)",
                                color: "rgba(255,255,255,0.95)",
                                borderRadius: "18px 18px 4px 18px",
                                boxShadow: "0 2px 12px rgba(92,74,223,0.35)",
                              }
                            : {
                                background: "rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.82)",
                                borderRadius: "18px 18px 18px 4px",
                                border: "0.5px solid rgba(255,255,255,0.08)",
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>
          </motion.div>
        ) : (
          /* ===== 일반 뷰 ===== */
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 5개 스탯 카드 */}
            <div className="flex flex-row gap-3">
              {STAT_FIELDS.map((field, index) => {
                const rawValue = currentData?.[field.key];
                const numericValue =
                  rawValue != null
                    ? field.toNumber(rawValue as string | number)
                    : 0;
                const todayVal = latestData
                  ? field.toNumber(latestData[field.key] as string | number)
                  : null;
                const prevVal = prevData
                  ? field.toNumber(prevData[field.key] as string | number)
                  : null;
                const delta =
                  todayVal !== null && prevVal !== null
                    ? todayVal - prevVal
                    : undefined;
                return (
                  <StatCard
                    key={field.key}
                    title={field.title}
                    value={numericValue}
                    unit={field.unit}
                    delta={delta}
                    isChartHovered={hoveredChartIndex !== null}
                    index={index}
                    onHover={(hovered) =>
                      setHoveredCardIndex(hovered ? index : null)
                    }
                    onClick={() => handleCardClick(index)}
                  />
                );
              })}
            </div>

            {/* WeeklyChart(2/3) + TopSupporters(1/3) */}
            <div className="flex flex-row gap-4" style={{ height: 360 }}>
              <div className="w-2/3 h-full">
                <WeeklyChart
                  liveStats={liveStatsWeek}
                  onHoverIndex={setHoveredChartIndex}
                  hoveredIndex={hoveredChartIndex}
                  highlightedKey={highlightedKey}
                />
              </div>
              <div className="w-1/3 h-full">
                <TopSupporters />
              </div>
            </div>

            {/* 시청자 유지율 (항상 최신 방송 기준, 2/3 너비) */}
            {latestData && (
              <div className="w-2/3">
                <RetentionRate
                  totalVisitors={latestData.totalVisitors}
                  retentionRate={latestData.retentionRate}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveStats;
