"use client";
import { getPostLiveStatsWeek } from "@/api";

import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import StatCard from "./stat_card";
import { AvgForWeekProps, LiveStatsProps } from "@/types/live";
import WeeklyTrendChart from "./weekly_trend_chart";
import { usePostLive } from "@/hooks/usePostLive";
const LiveStat = () => {
  const { avgForWeek } = usePostLive();

  const { user } = useUserStore((state) => state);

  const { data: avg_for_week } = useQuery<
    LiveStatsProps[] | null,
    Error,
    AvgForWeekProps
  >({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStatsWeek(user?.user_id),
    enabled: !!user?.user_id,
  });

  const avg_week = {
    avgViewer: {
      title: "평균 시청자 수 ",
      value: avg_for_week?.avgViewer,
      unit: "명",
    },
    peakViewer: {
      title: "최고 시청자 수 ",
      value: avg_for_week?.peakViewer,
      unit: "명",
    },
    intoChatRate: {
      title: "채팅 전환율",
      value: avg_for_week?.intoChatRate,
      unit: "%",
    },
    fund: { title: "후원금액", value: avg_for_week?.fund, unit: "원" },
  };
  type ref_store = Record<string, HTMLDivElement | null>;
  // const postLiveStatCardRef = useRef<HTMLDivElement>(null);
  const postLiveStatCardRef = useRef<ref_store>({});
  return (
    <div>
      <div className="flex border border-red-400 flex-row gap-4 pb-2">
        {Object.entries(avg_week).map((stat) => (
          <StatCard
            key={stat[0]}
            liveStatCard={stat}
            ref={(element) => {
              if (element) {
                postLiveStatCardRef.current[stat[0]] = element;
              } else {
                delete postLiveStatCardRef.current[stat[0]];
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
          post_live_stats={post_live_stats}
          stat_card_ref={postLiveStatCardRef}
        />
        <div>새 컴포넌트</div>
      </div>
      <div className="h-full w-full border border-red-400">as</div>
    </div>
  );
};

export default LiveStat;
