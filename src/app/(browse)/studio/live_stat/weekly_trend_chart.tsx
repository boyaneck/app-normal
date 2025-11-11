import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart as LineChartIcon, TrendingUp } from "lucide-react"; // LineChart 이름 충돌 방지
import React, { forwardRef, RefObject } from "react";
import { usePostLive } from "@/hooks/usePostLive";
import { post_live_stats_props } from "@/types/live";

// ----------------------------------------------------------------------
// 1. 차트 데이터 (임시)
// ----------------------------------------------------------------------

const MOCK_DATA = [
  { name: "화", 후원금액: 4000, 시청자: 2400 },
  { name: "수", 후원금액: 3000, 시청자: 1398 },
  { name: "목", 후원금액: 2000, 시청자: 9800 },
  { name: "금", 후원금액: 2780, 시청자: 3908 },
  { name: "토", 후원금액: 1890, 시청자: 4800 },
  { name: "일", 후원금액: 2390, 시청자: 3800 },
  { name: "월", 후원금액: 3490, 시청자: 4300 },
];

type store = Record<string, HTMLDivElement | null>;
interface props {
  post_live_stats: post_live_stats_props[] | null | undefined;
  stat_card_ref: React.RefObject<store>;
}
const WeeklyTrendChart = ({ post_live_stats, stat_card_ref }: props) => {
  console.log("포스트 라이브 스탯", post_live_stats);
  console.log("ref 확인하기", stat_card_ref.current);
  const { animateCount } = usePostLive();
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/90 border border-indigo-400/70 p-3 rounded-lg shadow-xl text-white backdrop-blur-sm">
          <p className="font-bold text-sm mb-1 text-indigo-300">
            {label}요일 방송 통계
          </p>
          <div className="space-y-1">
            {payload.map((item, index) => (
              <p key={index} className="text-xs flex justify-between">
                <span
                  style={{ color: item.color }}
                  className="font-medium mr-3"
                >
                  {item.name}:
                </span>
                <span className="font-semibold">
                  {item.name === "후원금액"
                    ? `${item.value.toLocaleString()} 원`
                    : `${item.value.toLocaleString()} 명`}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const chartMouseMove = (state: any) => {
    if (state.activePayload && state.activePayload.length) {
      chartMouseLeave(state.activePayload[0].payload);

      const ref = stat_card_ref.current?.textContent;
      const payload: post_live_stats_props = state.activePayload[0];
      const post_live_obj = { payload, ref };
      console.log("typeof ref의 타입을 알려줘", typeof ref);
      console.log("onmouse시 ref 데이터", stat_card_ref);
      animateCount(post_live_obj);
    } else {
      chartMouseLeave(null);
    }
  };
  const chartMouseLeave = (val: null) => {};

  // MOCK_DATA를 기본값으로 설정
  return (
    <div
      className={`border border-white/20 shadow-md p-4
        bg-white/10 transition-all duration-300 rounded-xl min-h-[450px] backdrop-blur-md
        hover:ring-2 hover:ring-indigo-400/70 relative
      `}
    >
      <div className="flex items-center text-white mb-4 text-lg font-semibold border-b border-indigo-500/30 pb-2">
        <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />
        주간 방송 핵심 지표 추이 (7일)
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          // data={MOCK_DATA}
          data={post_live_stats}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          onMouseMove={chartMouseMove}
          onMouseLeave={() => chartMouseLeave(null)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#555"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="avg_viewer"
            stroke="#fff"
            padding={{ left: 10, right: 10 }}
            className="text-xs"
          />

          <YAxis
            stroke="#fff"
            tickFormatter={(value) => value.toLocaleString()} // 1000 단위 콤마
            className="text-xs"
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend wrapperStyle={{ paddingTop: "10px" }} />

          <Line
            type="monotone"
            dataKey="fund"
            stroke="#F56565" // 빨간색 (후원)
            strokeWidth={3}
            activeDot={{
              r: 8,
              fill: "#F56565",
              stroke: "white",
              strokeWidth: 2,
            }}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="all_viewer"
            stroke="#48BB78" // 녹색 (시청자)
            strokeWidth={3}
            activeDot={{
              r: 8,
              fill: "#48BB78",
              stroke: "white",
              strokeWidth: 2,
            }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTrendChart;
