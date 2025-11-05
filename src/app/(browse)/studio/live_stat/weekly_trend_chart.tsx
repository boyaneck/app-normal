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
import React from "react";

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

const calculateWeekSum = (live_stat_arr) => {
  if (!live_stat_arr || live_stat_arr.length === 0)
    return { data: null, sum: [] };
};
// ----------------------------------------------------------------------
// 2. 커스텀 Tooltip 컴포넌트
// ----------------------------------------------------------------------

// Recharts Tooltip은 active, payload, label 세 가지 props를 받습니다.
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
              <span style={{ color: item.color }} className="font-medium mr-3">
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
    console.log(
      "마우스 호버시생기는 데이터 확인하기",
      state.activePayload[0].payload
    );
  } else {
    chartMouseLeave(null);
  }
};
const chartMouseLeave = (val: null) => {};
const WeeklyTrendChart = ({ data = MOCK_DATA }) => {
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
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          onMouseMove={chartMouseMove}
          onMouseLeave={() => chartMouseLeave(null)}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#555"
            strokeOpacity={0.5}
          />

          {/* dataKey="name"이 MOCK_DATA의 '화', '수', ...와 일치 */}
          <XAxis
            dataKey="name"
            stroke="#fff"
            padding={{ left: 10, right: 10 }}
            className="text-xs"
          />

          {/* Y축의 도메인을 동적으로 설정하면 데이터 범위에 맞게 조정됩니다. */}
          <YAxis
            stroke="#fff"
            tickFormatter={(value) => value.toLocaleString()} // 1000 단위 콤마
            className="text-xs"
          />

          {/* CustomTooltip을 content prop으로 전달 */}
          <Tooltip content={<CustomTooltip />} />

          <Legend wrapperStyle={{ paddingTop: "10px" }} />

          {/* dataKey="후원금액"이 MOCK_DATA의 '후원금액' 키와 일치 */}
          <Line
            type="monotone"
            dataKey="후원금액"
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

          {/* dataKey="시청자"이 MOCK_DATA의 '시청자' 키와 일치 */}
          <Line
            type="monotone"
            dataKey="시청자"
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
