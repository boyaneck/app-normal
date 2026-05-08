"use client";
import { useMemo } from "react";
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
import { PostLiveStats } from "@/types/live";

const LINE_CONFIG = [
  { key: "avgViewer",     name: "평균 시청자", color: "#3b82f6", unit: "명" },
  { key: "peakViewers",   name: "최고 시청자", color: "#8b5cf6", unit: "명" },
  { key: "totalVisitors", name: "총 방문자",   color: "#34d399", unit: "명" },
  { key: "fund",          name: "후원금액",    color: "#f59e0b", unit: "원" },
  { key: "intoChatRate",  name: "채팅 전환율", color: "#f87171", unit: "%" },
];

const METRIC_KEYS = LINE_CONFIG.map((l) => l.key);

interface WeeklyChartProps {
  liveStats: PostLiveStats[];
  onHoverIndex: (index: number | null) => void;
  hoveredIndex: number | null;
  highlightedKey: string | null;
}

const WeeklyChart = ({
  liveStats,
  onHoverIndex,
  hoveredIndex,
  highlightedKey,
}: WeeklyChartProps) => {
  // 오래된 날짜가 왼쪽, 최신이 오른쪽 (시간 순)
  const chronoStats = useMemo(() => [...liveStats].reverse(), [liveStats]);

  const chartData = useMemo(() => {
    if (!chronoStats.length) return [];

    if (highlightedKey) {
      // ── StatCard hover 중: 해당 지표만 실제 값으로 표시 ──
      return chronoStats.map((d) => {
        const raw = Number((d as any)[highlightedKey]) || 0;
        return {
          dayLabel: d.dayLabel,
          [highlightedKey]: raw,
          [`_raw_${highlightedKey}`]: raw,
        };
      });
    }

    // ── hover 없을 때: 5개 지표 각각 0~100 정규화 → Y축 공유 가능 ──
    const ranges: Record<string, { min: number; max: number }> = {};
    METRIC_KEYS.forEach((k) => {
      const vals = chronoStats.map((d) => Number((d as any)[k]) || 0);
      ranges[k] = { min: Math.min(...vals), max: Math.max(...vals) };
    });

    return chronoStats.map((d) => {
      const entry: any = { dayLabel: d.dayLabel };
      METRIC_KEYS.forEach((k) => {
        const raw = Number((d as any)[k]) || 0;
        const { min, max } = ranges[k];
        const range = max - min;
        entry[`_raw_${k}`] = raw;
        // 10~90 범위로 정규화 (값이 모두 같으면 50 고정)
        entry[k] = range === 0 ? 50 : ((raw - min) / range) * 80 + 10;
      });
      return entry;
    });
  }, [chronoStats, highlightedKey]);

  const highlightedConfig = LINE_CONFIG.find((l) => l.key === highlightedKey);

  // 툴팁: _raw_<key>로 실제 값 표시
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const items = highlightedKey
      ? payload.filter((p: any) => p.dataKey === highlightedKey)
      : payload;
    return (
      <div className="bg-[#0a0a0f]/90 backdrop-blur-2xl border border-white/[0.06] px-4 py-3 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2.5 font-medium">
          {label}요일
        </p>
        <div className="space-y-1.5">
          {items.map((item: any, i: number) => {
            const config = LINE_CONFIG.find((l) => l.key === item.dataKey);
            const rawValue = item.payload[`_raw_${item.dataKey}`] ?? item.value;
            const display =
              config?.unit === "원"
                ? `₩${rawValue.toLocaleString()}`
                : config?.unit === "%"
                  ? `${rawValue}%`
                  : rawValue.toLocaleString();
            return (
              <div key={i} className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}50` }}
                  />
                  <span className="text-[11px] text-white/50">{item.name ?? config?.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-white/90 tabular-nums">
                  {display}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ActiveDot = (props: any) => {
    const { cx, cy, stroke } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={10} fill={stroke} opacity={0.1} />
        <circle cx={cx} cy={cy} r={6} fill={stroke} opacity={0.2} />
        <circle cx={cx} cy={cy} r={3.5} fill="#0a0a0f" stroke={stroke} strokeWidth={2} />
      </g>
    );
  };

  const handleMouseMove = (state: any) => {
    if (state?.activeTooltipIndex !== undefined) onHoverIndex(state.activeTooltipIndex);
  };

  const getLineStyle = (key: string) => {
    if (!highlightedKey) return { strokeWidth: 2, opacity: 1 };
    if (key === highlightedKey) return { strokeWidth: 3, opacity: 1 };
    return { strokeWidth: 0, opacity: 0 }; // 다른 라인 완전히 숨김
  };

  return (
    <div className="h-full flex flex-col rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05]">
      {/* 헤더 */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-white/70 tracking-tight">주간 방송 추이</h3>
            <p className="text-[10px] text-white/20 mt-0.5">
              {highlightedKey
                ? `${highlightedConfig?.name} · 실제 수치`
                : "최근 7일 · 상대 추이"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {LINE_CONFIG.map((line) => (
            <div
              key={line.key}
              className={`flex items-center gap-1.5 transition-opacity duration-300 ${
                highlightedKey && highlightedKey !== line.key ? "opacity-20" : "opacity-100"
              }`}
            >
              <div className="w-4 h-[2px] rounded-full" style={{ backgroundColor: line.color }} />
              <span className="text-[10px] text-white/30">{line.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 차트 */}
      <div className="flex-1 min-h-0 px-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 24, left: highlightedKey ? 8 : 0, bottom: 4 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => onHoverIndex(null)}
          >
            <defs>
              {LINE_CONFIG.map((line) => (
                <linearGradient key={line.key} id={`gradient_${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={line.color} stopOpacity={highlightedKey === line.key ? 0.3 : 0.1} />
                  <stop offset="100%" stopColor={line.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.2)", fontWeight: 500 }}
              dy={6}
            />
            {/* highlightedKey 일 때는 실제 Y축, 아닐 때는 숨김 */}
            {highlightedKey ? (
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.15)" }}
                tickFormatter={(v) =>
                  highlightedConfig?.unit === "원"
                    ? v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    : highlightedConfig?.unit === "%"
                      ? `${v}%`
                      : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={36}
              />
            ) : (
              <YAxis hide domain={[0, 100]} />
            )}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            {LINE_CONFIG.map((line) => {
              const style = getLineStyle(line.key);
              if (style.strokeWidth === 0) return null; // 완전 숨김
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
                  fillOpacity={highlightedKey === line.key ? 0.8 : 0.5}
                  activeDot={<ActiveDot />}
                  dot={false}
                  style={{ transition: "stroke-width 0.3s ease" }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 인디케이터 */}
      <div className="flex-shrink-0 px-6 pb-4 flex justify-center gap-1.5">
        {chartData.map((_, i) => (
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
