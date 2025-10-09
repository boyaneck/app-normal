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
const ManageRevenuePage = () => {
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

  const { data: post_live_stats } = useQuery({
    queryKey: [`post_live_stats`],
    queryFn: () => getPostLiveStats(user?.user_id),
    select: (stats) => {
      const today = new Date();
      const result = [];

      // 7일치 배열 뼈대 생성 루프
      for (let i = 6; i >= 0; i--) {}
    },
    initialData: [],
    enabled: !!user?.user_id,
  });

  console.log(
    "유저의 정보",
    post_live_stats?.map((stat) => {
      console.log("맵이잖아", stat.peak_viewer);
    })
  );
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

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={stat_graph}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />{" "}
          {/* 옅은 격자선 */}
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
      </ResponsiveContainer>
    </div>
  );
};

export default ManageRevenuePage;
