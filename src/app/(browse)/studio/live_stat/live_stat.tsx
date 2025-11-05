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
const LiveStat = () => {
  //여기가 방송 관리 페이지로 변경경

  const { user } = useUserStore((state) => state);

  const { data: post_live_stats } = useQuery<post_live_stats_props | null>({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStats(user?.user_id),
    enabled: !!user?.user_id,
    // staleTime: 1000 * 60 * 60,
  });
  console.log("현재 가져온 7일치 데이터", post_live_stats);
  const is_live_post_arr = Array.isArray(post_live_stats)
    ? post_live_stats
    : [];
  const live_num_of_week = is_live_post_arr.length;
  const liveStats = (stat_prop: post_live_stats_props | null | undefined) => {
    const initial_data = {
      avg_viewer: 0,
      peak_viewer: 0,
      into_chat_rate: 0,
      fund: 0,
    };
    if (!stat_prop) return null;
    const cal_live_week = is_live_post_arr.reduce((acc, stat) => {
      const avg_v = Number(stat.avg_viewer) || 0;
      const peak_v = Number(stat.peak_viewer) || 0;
      const chat_r = Number(stat.into_chat_rate) || 0;
      const fd = Number(stat.fund) || 0;

      acc.avg_viewer_sum += avg_v;
      acc.peak_viewer_sum += peak_v;
      acc.into_chat_rate_sum += chat_r;
      acc.fund_sum += fd;

      console.log("reduce의 결과값을 알려주세요", acc);
      return acc;
    }, initial_data);

    const avg_of_week = {
      avg_viewer: Math.round(
        cal_live_week.avg_viewer_sum / live_num_of_week || 1
      ),
      peak_viewer: Math.round(
        cal_live_week.peak_viewer_sum / live_num_of_week || 1
      ),
      into_chat_rate: Math.round(
        cal_live_week.into_chat_rate / live_num_of_week || 1
      ),
      fund: Math.round(cal_live_week.fund_sum / live_num_of_week || 1),
    };

    console.log("이번주 방송 각각의 지표 나눈것", avg_of_week);
    return [
      {
        title: "평균 시청자 수 ",
        value: stat_prop?.avg_viewer,
        positive_color: "",
      },
      {
        title: "최대 시청자 수 ",
        value: stat_prop?.peak_viewer,
      },
      {
        title: "채팅 전환률 ",
        value: stat_prop?.into_chat_rate,
      },
      {
        title: "총 후원 금액",
        value: stat_prop?.fund,
        icon: DollarSign,
      },
    ];
  };

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

  const resultStats = liveStats(post_live_stats);
  return (
    // <div style={{ fontFamily: "sans-serif" }}>
    <div>
      <div className="flex flex-row gap-4 pb-2">
        {resultStats?.map((stat) => (
          <StatCard key={stat.title} live_stats_card={stat} />
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
