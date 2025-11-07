"use client";
import { getPostLiveStats } from "@/api";

import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import StatCard from "./stat_card";
import { post_live_stats_props } from "@/types/live";
import { DollarSign } from "lucide-react";
import WeeklyTrendChart from "./weekly_trend_chart";
import RecentNews from "./recent_new";
import BriefRevenue from "./brief_revenue";
import { usePostLive } from "@/hooks/usePostLive";
const LiveStat = () => {
  const { statCardRef, avgForWeek } = usePostLive();

  const { user } = useUserStore((state) => state);

  const { data: post_live_stats } = useQuery<post_live_stats_props | null>({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStats(user?.user_id),
    enabled: !!user?.user_id,
    // staleTime: 1000 * 60 * 60,
  });

  const detailStats = [
    {
      title: "채팅 전환율",
      value: "22.5%",
      trend: "▲ 3.1%",
      trendColor: "text-blue-600",
      barColor: "bg-blue-600", // Progress bar 색상
      // icon: MessageSquare,
      goalText: "총 시청자 대비",
      progressValue: 22.5, // 실제 참여율 값 (22.5%)
    },
    {
      title: "구독 전환율",
      value: "1.8%",
      trend: "▲ 0.2%",
      trendColor: "text-pink-600",
      barColor: "bg-pink-600", // Progress bar 색상
      // icon: Repeat,
      goalText: "일반 시청자 대비",
      progressValue: 1.8, // 실제 전환율 값 (1.8%)
    },
  ];

  const resultStats = [
    { title: "fund", value: "111" },
    { title: "fund", value: "111" },
    { title: "fund", value: "111" },
    { title: "fund", value: "111" },
  ];
  // const resultStats = avgForWeek(post_live_stats);
  return (
    // <div style={{ fontFamily: "sans-serif" }}>
    <div>
      <div className="flex flex-row gap-4 pb-2">
        {resultStats?.map((stat) => (
          <StatCard
            key={stat.title}
            live_stats_card={stat}
            stat_card_ref={statCardRef}
          />
        ))}
      </div>
      <div
        className={`
          bg-gray-400
      grid grid-cols-1 md:grid-cols-2 justify-between 
      p-2 border border-yellow-300 gap-2`}
      >
        <WeeklyTrendChart />
        <RecentNews />
        <BriefRevenue />
        <div>새 컴포넌트</div>
      </div>
      <div className="h-full w-full border border-red-400">as</div>
    </div>
  );
};

export default LiveStat;
