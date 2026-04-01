"use client";
import { useState, useMemo } from "react";
import StatCard from "./stat-card";
import WeeklyChart from "./weekly-chart";
import TopSupporters from "./top-supporters";
import RetentionRate from "./retantion-rate";

const MOCK_RETENTION_STATS = {
  total_visitors: 2847,
  stayed_viewers: 1962,
  retention_rate: "0.69",
};
const MOCK_WEEKLY_DATA = [
  {
    day_label: "월",
    avg_viewer: 342,
    peak_viewer: 891,
    all_viewer: 2450,
    fund: 45000,
    chat_rate: 32,
  },
  {
    day_label: "화",
    avg_viewer: 289,
    peak_viewer: 720,
    all_viewer: 1980,
    fund: 32000,
    chat_rate: 28,
  },
  {
    day_label: "수",
    avg_viewer: 512,
    peak_viewer: 1340,
    all_viewer: 4100,
    fund: 87000,
    chat_rate: 41,
  },
  {
    day_label: "목",
    avg_viewer: 198,
    peak_viewer: 410,
    all_viewer: 1200,
    fund: 15000,
    chat_rate: 19,
  },
  {
    day_label: "금",
    avg_viewer: 623,
    peak_viewer: 1580,
    all_viewer: 5200,
    fund: 124000,
    chat_rate: 45,
  },
  {
    day_label: "토",
    avg_viewer: 891,
    peak_viewer: 2100,
    all_viewer: 7800,
    fund: 210000,
    chat_rate: 52,
  },
  {
    day_label: "일",
    avg_viewer: 734,
    peak_viewer: 1820,
    all_viewer: 6300,
    fund: 178000,
    chat_rate: 48,
  },
];

export const STAT_FIELDS = [
  { key: "avg_viewer", title: "평균 시청자", unit: "명" },
  { key: "peak_viewer", title: "최고 시청자", unit: "명" },
  { key: "all_viewer", title: "총 시청자", unit: "명" },
  { key: "fund", title: "후원 금액", unit: "원" },
  { key: "chat_rate", title: "채팅 전환율", unit: "%" },
] as const;

const LiveStats = () => {
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(
    null,
  );
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const currentData = useMemo(() => {
    const index = hoveredChartIndex ?? MOCK_WEEKLY_DATA.length - 1;
    return MOCK_WEEKLY_DATA[index];
  }, [hoveredChartIndex]);

  const highlightedDataKey = useMemo(() => {
    if (hoveredCardIndex === null) return null;
    return STAT_FIELDS[hoveredCardIndex]?.key ?? null;
  }, [hoveredCardIndex]);

  return (
    <div className="space-y-4 p-6">
      {/* 상단: 5개 스탯 카드 */}
      <div className="flex flex-row gap-3">
        {STAT_FIELDS.map((field, index) => (
          <StatCard
            key={field.key}
            title={field.title}
            value={
              (currentData?.[
                field.key as keyof typeof currentData
              ] as number) ?? 0
            }
            unit={field.unit}
            isChartHovered={hoveredChartIndex !== null}
            index={index}
            onHover={(hovered) => setHoveredCardIndex(hovered ? index : null)}
          />
        ))}
      </div>

      {/* 하단: 차트 + TopSupporters 나란히 */}
      <div className="flex flex-row gap-4 items-stretch">
        {/* WeeklyChart: 남은 공간 채움 */}
        <div className="flex-1 min-w-0">
          <WeeklyChart
            post_live_stats={MOCK_WEEKLY_DATA}
            onHoverIndex={setHoveredChartIndex}
            hoveredIndex={hoveredChartIndex}
            highlightedDataKey={highlightedDataKey}
          />
        </div>

        {/* TopSupporters: 고정 너비 */}
        <div className="flex-shrink-0">
          <TopSupporters />
          <RetentionRate
            totalVisitors={MOCK_RETENTION_STATS.total_visitors} // sCard(ALL_VISITORS)
            stayedViewers={MOCK_RETENTION_STATS.stayed_viewers} // sCard(STAY_MINUTE)
            retentionRate={parseFloat(MOCK_RETENTION_STATS.retention_rate)} // 0~1 소수
            // totalVisitors={stats.total_visitors} // sCard(ALL_VISITORS)
            // stayedViewers={stats.stayed_viewers} // sCard(STAY_MINUTE)
            // retentionRate={parseFloat(stats.retention_rate)} // 0~1 소수
          />
        </div>
      </div>
    </div>
  );
};

export default LiveStats;
