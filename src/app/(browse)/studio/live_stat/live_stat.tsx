"use client";
import { getPostLiveStatsWeek } from "@/api";

import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";

import StatCard from "./stat_card";
import {
  avg_for_week_props,
  post_live_stats_props,
  weekly_live_stats_props,
} from "@/types/live";
import { DollarSign } from "lucide-react";
import WeeklyTrendChart from "./weekly_trend_chart";
import RecentNews from "./recent_new";
import BriefRevenue from "./brief_revenue";
import { usePostLive } from "@/hooks/usePostLive";
const LiveStat = () => {
  const { avgForWeek } = usePostLive();

  const { user } = useUserStore((state) => state);

  const { data: avg_for_week } = useQuery<
    post_live_stats_props[] | null,
    Error,
    avg_for_week_props
  >({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStatsWeek(user?.user_id),
    enabled: !!user?.user_id,
    select: (live_stats: post_live_stats_props[] | null) => {
      const weekly = avgForWeek(live_stats);
      //평균값이 가각 4개 항목으로 생김
      return weekly;
    },
  });
  const { data: post_live_stats } = useQuery<post_live_stats_props[] | null>({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStatsWeek(user?.user_id),
    enabled: !!user?.user_id,
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
  ];

  const avg_week = {
    avg_viewr: {
      title: "평균 시청자 수 ",
      value: avg_for_week?.avg_viewer,
      unit: "명",
    },
    peak_viewer: {
      title: "최고 시청자 수 ",
      value: avg_for_week?.peak_viewer,
      unit: "명",
    },
    into_chat_rate: {
      title: "채팅 전환율",
      value: avg_for_week?.into_chat_rate,
      unit: "%",
    },
    fund: { title: "후원금액", value: avg_for_week?.fund, unit: "원" },
  };
  type ref_store = Record<string, HTMLDivElement | null>;
  // const postLiveStatCardRef = useRef<HTMLDivElement>(null);
  const postLiveStatCardRef = useRef<ref_store>({});
  console.log("상위 컴포넌트에서 해당 useRef확인", postLiveStatCardRef);
  return (
    <div>
      <div className="flex border border-red-400 flex-row gap-4 pb-2">
        {Object.entries(avg_week).map((stat) => (
          <StatCard
            key={stat[0]}
            live_stats_card={stat}
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
        <RecentNews />
        <BriefRevenue />
        <div>새 컴포넌트</div>
      </div>
      <div className="h-full w-full border border-red-400">as</div>
    </div>
  );
};

export default LiveStat;
