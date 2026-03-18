"use client";
import { getLiveStatsWeek } from "@/api";

import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import StatCard from "./stat-card";
import { AvgForWeekProps, LiveStatsProps } from "@/types/live";
import WeeklyTrendChart from "./weekly-chart";
import { usePostLive } from "@/hooks/usePostLive";
const LiveStat = () => {
  const { avgForWeek } = usePostLive();

  const { user } = useUserStore((state) => state);

  const { data: liveStatsWeek } = useQuery<LiveStatsProps[] | null, Error>({
    queryKey: [`liveStatsWeek`, user?.user_id],
    queryFn: () => getLiveStatsWeek(user?.user_id),
    enabled: !!user?.user_id,
  });

  type ref_store = Record<string, HTMLDivElement | null>;
  // const postLiveStatCardRef = useRef<HTMLDivElement>(null);
  const statCardRef = useRef<ref_store>({});
  return (
    <div>
      <div className="flex border border-red-400 flex-row gap-4 pb-2">
        {liveStatsWeek?.map((stat) => (
          <StatCard
            key={stat.avgViewer}
            liveStatCard={stat}
            ref={(element) => {
              if (element) {
                statCardRef.current[stat[0]] = element;
              } else {
                delete statCardRef.current[stat[0]];
              }
            }}
          />
        ))}
      </div>
      <div
        className={`
          bg-gray-400
      grid grid-cols-1 md:grid-cols-2 justify-between 
      p-2 border border-yellow-300 gap-2`}
      >
        <WeeklyTrendChart
          post_live_stats={liveStatsWeek}
          stat_card_ref={statCardRef}
        />
        <div>새 컴포넌트</div>
      </div>
      <div className="h-full w-full border border-red-400">as</div>
    </div>
  );
};

export default LiveStat;
