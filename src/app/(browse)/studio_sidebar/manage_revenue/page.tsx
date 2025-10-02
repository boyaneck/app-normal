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
  const { user } = useUserStore((state) => state);
  console.log("유저의 id가 방정보와 같나 ?", user);
  const { data: post_live_stats } = useQuery({
    queryKey: [`post_live_stats`],
    queryFn: () => getPostLiveStats(user?.user_id),
    enabled: !!user?.user_id,
  });

  console.log("유저의 정보", post_live_stats);

  const bar_graph = [
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
        <LineChart data={bar_graph}>
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
