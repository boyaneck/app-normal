import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface WeeklyDataItem {
  day_label: string;
  avg_viewer: number;
  peak_viewer: number;
  all_viewer: number;
  fund: number;
  chat_rate: number;
}

// ===== 5개 라인 설정 =====
const LINE_CONFIG = [
  { key: "avg_viewer", name: "평균 시청자", color: "#3b82f6", unit: "명" },
  { key: "peak_viewer", name: "최고 시청자", color: "#8b5cf6", unit: "명" },
  { key: "all_viewer", name: "총 시청자", color: "#34d399", unit: "명" },
  { key: "fund", name: "후원금액", color: "#f59e0b", unit: "원" },
  { key: "chat_rate", name: "채팅 전환율", color: "#f87171", unit: "%" },
];

interface WeeklyChartProps {
  post_live_stats: WeeklyDataItem[];
  onHoverIndex: (index: number | null) => void;
  hoveredIndex: number | null;
  highlightedDataKey: string | null;
}

const WeeklyChart = ({
  post_live_stats,
  onHoverIndex,
  hoveredIndex,
  highlightedDataKey,
}: WeeklyChartProps) => {
  // ===== 커스텀 툴팁 =====
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/[0.06] px-4 py-3 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2.5 font-medium">
          {label}요일
        </p>
        <div className="space-y-1.5">
          {payload.map((item: any, i: number) => {
            const config = LINE_CONFIG.find((l) => l.key === item.dataKey);
            return (
              <div key={i} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 6px ${item.color}50`,
                    }}
                  />
                  <span className="text-[11px] text-white/50">{item.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-white/90 tabular-nums">
                  {config?.unit === "원"
                    ? `₩${item.value.toLocaleString()}`
                    : config?.unit === "%"
                      ? `${item.value}%`
                      : item.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===== 커스텀 Dot =====
  const ActiveDot = (props: any) => {
    const { cx, cy, stroke } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={stroke} opacity={0.1} />
        <circle cx={cx} cy={cy} r={6} fill={stroke} opacity={0.2} />
        <circle
          cx={cx}
          cy={cy}
          r={3.5}
          fill="#0a0a0f"
          stroke={stroke}
          strokeWidth={2}
        />
      </g>
    );
  };

  // ===== 마우스 이벤트 =====
  const handleMouseMove = (state: any) => {
    if (state?.activeTooltipIndex !== undefined) {
      onHoverIndex(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    onHoverIndex(null);
  };

  // ===== 라인별 스타일 계산 =====
  const getLineStyle = (key: string) => {
    if (!highlightedDataKey) {
      return { strokeWidth: 2, opacity: 1 };
    }
    if (key === highlightedDataKey) {
      return { strokeWidth: 3.5, opacity: 1 };
    }
    return { strokeWidth: 1, opacity: 0.2 };
  };

  return (
    <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] overflow-hidden">
      {/* ===== 헤더 ===== */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-white/70 tracking-tight">
              주간 방송 추이
            </h3>
            <p className="text-[10px] text-white/20 mt-0.5">최근 7일</p>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 flex-wrap">
          {LINE_CONFIG.map((line) => (
            <div
              key={line.key}
              className={`flex items-center gap-1.5 transition-opacity duration-300 ${
                highlightedDataKey && highlightedDataKey !== line.key
                  ? "opacity-30"
                  : "opacity-100"
              }`}
            >
              <div
                className="w-4 h-[2px] rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-[10px] text-white/30">{line.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 차트 (기존의 2/3 크기) ===== */}
      <div className="px-2 pb-3">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart
            data={post_live_stats}
            margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* 그라데이션 정의 */}
            <defs>
              {LINE_CONFIG.map((line) => (
                <linearGradient
                  key={line.key}
                  id={`gradient_${line.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={line.color}
                    stopOpacity={highlightedDataKey === line.key ? 0.2 : 0.08}
                  />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="0"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />

            <XAxis
              dataKey="day_label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "rgba(255,255,255,0.2)",
                fontWeight: 500,
              }}
              dy={6}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
              width={36}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "rgba(255,255,255,0.06)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            {/* 5개 라인 */}
            {LINE_CONFIG.map((line) => {
              const style = getLineStyle(line.key);
              return (
                <Area
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={style.strokeWidth}
                  strokeOpacity={style.opacity}
                  fill={`url(#gradient_${line.key})`}
                  fillOpacity={
                    highlightedDataKey
                      ? highlightedDataKey === line.key
                        ? 1
                        : 0.05
                      : 0.6
                  }
                  activeDot={
                    !highlightedDataKey || highlightedDataKey === line.key ? (
                      <ActiveDot />
                    ) : (
                      false
                    )
                  }
                  dot={false}
                  style={{
                    transition: "stroke-width 0.3s ease, opacity 0.3s ease",
                  }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ===== 하단 인디케이터 ===== */}
      <div className="px-6 pb-4 flex justify-center gap-1.5">
        {post_live_stats.map((_, i) => (
          <div
            key={i}
            className={`h-[3px] rounded-full transition-all duration-300 ${
              hoveredIndex === i ? "w-6 bg-white/40" : "w-2 bg-white/[0.08]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyChart;
