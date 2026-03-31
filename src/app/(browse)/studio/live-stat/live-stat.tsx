// "use client";
// import { getLiveStatsWeek } from "@/api";

// import useUserStore from "@/store/user";
// import { useQuery } from "@tanstack/react-query";
// import React, { useRef } from "react";
// import StatCard from "./stat-card";
// import { AvgForWeekProps, LiveStatsProps } from "@/types/live";
// import WeeklyTrendChart from "./weekly-chart";
// import { usePostLive } from "@/hooks/usePostLive";
// type RefType = Record<string, HTMLDivElement | null>;
// const LiveStat = () => {
//   const { avgForWeek } = usePostLive();

//   const { user } = useUserStore((state) => state);

//   //해당 유저의 id로 최근 7일치 방송 데이터 fetch
//   const { data: liveStatsWeek, isError } = useQuery<
//     LiveStatsProps[] | null,
//     Error
//   >({
//     queryKey: [`liveStatsWeek`, user?.userId],
//     queryFn: () => getLiveStatsWeek(user?.userId),
//     enabled: !!user?.userId,
//   });

//   console.log("최근 일주일 간의 데이터 확인 ,", liveStatsWeek);

//   const statCardRef = useRef<RefType>({});
//   return (
//     <div>
//       <div className="flex border border-red-400 flex-row gap-4 pb-2">
//         {liveStatsWeek?.map((stat) => (
//           <StatCard
//             key={stat.avgViewer}
//             liveStatCard={stat}
//             ref={(element) => {
//               if (element) {
//                 statCardRef.current[stat[0]] = element;
//               } else {
//                 delete statCardRef.current[stat[0]];
//               }
//             }}
//           />
//         ))}
//       </div>
//       <div
//         className={`
//           bg-gray-400
//       grid grid-cols-1 md:grid-cols-2 justify-between
//       p-2 border border-yellow-300 gap-2`}
//       >
//         <WeeklyTrendChart
//           post_live_stats={liveStatsWeek}
//           stat_card_ref={statCardRef}
//         />
//         <div>새 컴포넌트</div>
//       </div>
//       <div className="h-full w-full border border-red-400">as</div>
//     </div>
//   );
// };

// export default LiveStat;
"use client";

import { useState, useMemo } from "react";
import StatCard from "./stat-card";
import WeeklyChart from "./weekly-chart";

// ===== 임시 데이터 (7일치) =====
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

// ===== 5개 지표 - key는 차트의 dataKey와 일치해야 함 =====
export const STAT_FIELDS = [
  { key: "avg_viewer", title: "평균 시청자", unit: "명" },
  { key: "peak_viewer", title: "최고 시청자", unit: "명" },
  { key: "all_viewer", title: "총 시청자", unit: "명" },
  { key: "fund", title: "후원 금액", unit: "원" },
  { key: "chat_rate", title: "채팅 전환율", unit: "%" },
] as const;

const LiveStats = () => {
  // 차트 hover → 카드 데이터 변경
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(
    null,
  );
  // 카드 hover → 차트 라인 강조
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const currentData = useMemo(() => {
    const index = hoveredChartIndex ?? MOCK_WEEKLY_DATA.length - 1;
    return MOCK_WEEKLY_DATA[index];
  }, [hoveredChartIndex]);

  // hoveredCardIndex → 해당 STAT_FIELDS의 key (차트 dataKey)
  const highlightedDataKey = useMemo(() => {
    if (hoveredCardIndex === null) return null;
    return STAT_FIELDS[hoveredCardIndex]?.key ?? null;
  }, [hoveredCardIndex]);

  return (
    <div className="space-y-4 p-6">
      {/* ===== 상단: 5개 스탯 카드 ===== */}
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

      {/* ===== 하단: 주간 차트 ===== */}
      <WeeklyChart
        post_live_stats={MOCK_WEEKLY_DATA}
        onHoverIndex={setHoveredChartIndex}
        hoveredIndex={hoveredChartIndex}
        highlightedDataKey={highlightedDataKey}
      />
    </div>
  );
};

export default LiveStats;
