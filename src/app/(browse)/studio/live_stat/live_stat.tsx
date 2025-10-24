"use client";
import { getPostLiveStats } from "@/api";

import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import StatCard from "./stat_card";
import { post_live_stats_props } from "@/types/live";
import { DollarSign } from "lucide-react";
import WeeklyTrendChart from "./weekly_trend_chart";
import RecentNews from "./recent_new";
import BriefRevenue from "./brief_revenue";
const LiveStat = () => {
  //여기가 방송 관리 페이지로 변경경

  const { user } = useUserStore((state) => state);
  const getDayNameFromDate = (date: Date) => {
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return days[date.getDay()];
  };

  const { data: post_live_stats } = useQuery<post_live_stats_props | null>({
    queryKey: [`post_live_stats`, user?.user_id],
    queryFn: () => getPostLiveStats(user?.user_id),
    enabled: !!user?.user_id,
    // staleTime: 1000 * 60 * 60,
  });

  const liveStats = (stat_prop: post_live_stats_props | null | undefined) => {
    if (!stat_prop) return null;

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

  // trend: "80%",
  // trendColor: "text-amber-500", // 데이터가 긍정적일 때의 강조 색상
  // // icon: DollarSign,
  // goalText: "이번 달 목표 달성",
  // goalValue: 1556250,
  // currentValue: 1245000,
  // const progess_percent = Math.min(
  //   (stat.currentValue / stat.goalValue) * 100,
  //   100
  // );
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

  const stat_graph = [
    { name: "월요일", 후원금액: 4000, 시청자: 2400 },
    { name: "화요일", 후원금액: 3000, 시청자: 2210 },
    { name: "수요일", 후원금액: 2000, 시청자: 2290 },
    { name: "Apr", 후원금액: 2780, 시청자: 2000 },
    { name: "May", 후원금액: 1890, 시청자: 2181 },
    { name: "Jun", 후원금액: 2390, 시청자: 2500 },
    { name: "Jun", 후원금액: 2390, 시청자: 2500 },
    { name: "Jun", 후원금액: 2390, 시청자: 2500 },
    { name: "Jun", 후원금액: 2390, 시청자: 2500 },
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
      {/* <ResponsiveContainer width="100%" height={400}>
        <LineChart data={stat_graph}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />{" "}
          <XAxis dataKey="name" />
          <YAxis domain={[0, 10000]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="후원금액"
            stroke="#F56565" // 토스 스타일 파란색
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={false} // 데이터 포인트 제거
          />
          <Line
            type="monotone"
            dataKey="시청자"
            stroke="#48BB78" // 토스 스타일 하늘색
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={false} // 데이터 포인트 제거
          />
        </LineChart>
      </ResponsiveContainer> */}
    </div>
  );
};

export default LiveStat;
