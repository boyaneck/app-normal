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
  const getDay = (date: Date) => {
    // dateString 대신 Date 객체를 직접 받도록 수정 (코드 일관성 유지)
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

  // ... (컴포넌트 내부 또는 훅)

  const { data: post_live_stats } = useQuery({
    queryKey: [`post_live_stats`],
    queryFn: () => getPostLiveStats(user?.user_id),
    select: (stats) => {
      const today = new Date();
      const result = [];

      // 7일치 배열 뼈대 생성 루프
      for (let i = 6; i >= 0; i--) {
        // 6일 전부터 오늘(0)까지
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // YYYY-MM-DD 형식의 키 생성 (매칭용)
        const date_key = date.toISOString().split("T")[0];

        // 2. Supabase 데이터와 매칭
        const match_up = stats?.find((stat) =>
          // ⚠️ Supabase date 필드도 YYYY-MM-DD로 잘라주거나, stat.date가 YYYY-MM-DDTHH:MM:SSZ 형식임을 가정
          stat.date.startsWith(date_key)
        );

        // 3. 차트 형식에 맞게 객체 생성
        result.push({
          name: getDay(date), // 💡 수정: 요일 이름 추가
          후원금액: match_up?.donation_amount || 0, // 💡 후원금액 필드도 실제 데이터에서 가져오도록 가정
          시청자: match_up?.peak_viewer || 0,
        });
      }

      // 🚨 수정: 루프가 끝난 후 배열을 반환합니다.
      return result;
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
        <LineChart data={post_live_stats}>
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
      </ResponsiveContainer>
    </div>
  );
};

export default ManageRevenuePage;
