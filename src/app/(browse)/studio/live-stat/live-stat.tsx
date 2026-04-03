"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "./stat-card";
import WeeklyChart from "./weekly-chart";
import TopSupporters from "./top-supporters";
import RetentionRate from "./retantion-rate";
import { useQuery } from "@tanstack/react-query";
import { getLiveStatsWeek } from "@/api/live";
import { PostLiveStats } from "@/types/live";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export const STAT_FIELDS = [
  {
    key: "avgViewer" as const,
    title: "평균 시청자",
    unit: "명",
    toNumber: (v: string | number) => Math.round(parseFloat(String(v)) || 0),
  },
  {
    key: "peakViewers" as const,
    title: "최고 시청자",
    unit: "명",
    toNumber: (v: string | number) => Number(v) || 0,
  },
  {
    key: "totalVisitors" as const,
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
    key: "intoChatRate" as const,
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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("Failed"))
      return { title: "네트워크 오류", desc: "인터넷 연결을 확인한 후 다시 시도해주세요." };
    if (error.message.includes("JWT") || error.message.includes("auth"))
      return { title: "인증 오류", desc: "세션이 만료되었습니다. 다시 로그인해주세요." };
    return { title: "데이터 로드 실패", desc: error.message };
  }
  return { title: "알 수 없는 오류", desc: "잠시 후 다시 시도해주세요." };
};

const StatCardSkeleton = () => (
  <div className="flex flex-row gap-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex-1 min-w-[155px] rounded-2xl p-5 bg-white/10 animate-pulse h-[110px]" />
    ))}
  </div>
);

interface Props {
  roomName: string | undefined;
  selectedCardIndex: number | null;
  onCardSelect: (index: number | null, cards: MiniCardInfo[]) => void;
}

const LiveStats = ({ roomName, selectedCardIndex, onCardSelect }: Props) => {
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const { data: rawStats, isError, error, isLoading, isFetching, refetch } =
    useQuery<any[] | null, Error>({
      queryKey: ["liveStatsWeek", roomName],
      queryFn: () => getLiveStatsWeek(roomName),
      enabled: !!roomName,
      retry: 2,
      retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
      staleTime: 1000 * 60 * 5,
    });

  const liveStatsWeek: PostLiveStats[] | null = useMemo(() => {
    if (!rawStats) return null;
    return rawStats.map((item) => ({
      roomName: item.room_name,
      startedAt: item.started_at,
      dayLabel: item.started_at ? DAY_LABELS[new Date(item.started_at).getDay()] : "-",
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

  // 전체 카드 데이터 (미니 카드용)
  const allCardsData: MiniCardInfo[] = useMemo(() =>
    STAT_FIELDS.map((f, i) => ({
      index: i,
      title: f.title,
      unit: f.unit,
      value: currentData ? f.toNumber(currentData[f.key] as string | number) : 0,
    })),
    [currentData]
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
        <span className="text-sm">로그인 후 방송 통계를 확인할 수 있습니다.</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <StatCardSkeleton />
        <div className="rounded-2xl bg-white/[0.05] animate-pulse h-[300px]" />
      </div>
    );
  }

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

  if (!liveStatsWeek || liveStatsWeek.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-white/30">
        <span className="text-sm">아직 방송 기록이 없습니다.</span>
        <span className="text-xs">방송 종료 후 통계가 여기에 표시됩니다.</span>
      </div>
    );
  }

  const selectedField = selectedCardIndex !== null ? STAT_FIELDS[selectedCardIndex] : null;
  const selectedValue = selectedField && currentData
    ? selectedField.toNumber(currentData[selectedField.key] as string | number)
    : 0;

  return (
    <div className="space-y-4 p-6">
      <AnimatePresence mode="wait">
        {selectedCardIndex !== null ? (
          /* ===== 확장 뷰: 선택된 카드만 전체 너비로 ===== */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-2xl p-8 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(28px)",
              border: "0.5px solid rgba(0,0,0,0.08)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
            onClick={() => onCardSelect(null, [])}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/30 font-medium mb-4">
              {selectedField?.title}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[64px] font-semibold text-black/85 leading-none tabular-nums tracking-tight">
                {selectedValue.toLocaleString()}
              </span>
              <span className="text-[22px] text-black/25">{selectedField?.unit}</span>
            </div>
            <p className="mt-3 text-[11px] text-black/25">클릭하면 닫힙니다 · AI 분석 결과가 아래에 표시됩니다</p>
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
                const numericValue = rawValue != null ? field.toNumber(rawValue as string | number) : 0;
                return (
                  <StatCard
                    key={field.key}
                    title={field.title}
                    value={numericValue}
                    unit={field.unit}
                    isChartHovered={hoveredChartIndex !== null}
                    index={index}
                    onHover={(hovered) => setHoveredCardIndex(hovered ? index : null)}
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

            {/* 시청자 유지율 (항상 최신 방송 기준) */}
            {latestData && (
              <RetentionRate
                totalVisitors={latestData.totalVisitors}
                retentionRate={latestData.retentionRate}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveStats;
