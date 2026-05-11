"use client";
import { useMemo } from "react";
import {
  ComposedChart, Bar, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList, Cell,
} from "recharts";
import { PostLiveStats } from "@/types/live";

type MetricKey = "avgViewer" | "peakViewers" | "totalVisitors" | "fund" | "intoChatRate";

const METRIC: Record<MetricKey, { name: string; color: string; unit: string; axis: "viewers" | "fund" | "pct" }> = {
  avgViewer:     { name: "평균 시청자", color: "#38bdf8", unit: "명", axis: "viewers" },
  peakViewers:   { name: "최고 시청자", color: "#a78bfa", unit: "명", axis: "viewers" },
  totalVisitors: { name: "총 방문자",   color: "#2dd4bf", unit: "명", axis: "viewers" },
  fund:          { name: "후원금액",    color: "#e9a800", unit: "원", axis: "fund"    },
  intoChatRate:  { name: "채팅 전환율", color: "#fb7185", unit: "%",  axis: "pct"     },
};

const ALL_KEYS = Object.keys(METRIC) as MetricKey[];

interface WeeklyChartProps {
  liveStats: PostLiveStats[];
  onHoverIndex: (index: number | null) => void;
  hoveredIndex: number | null;
  highlightedKey: string | null;
}

/* ─── 라벨 포맷 ────────────────────────────────── */
const labelFmt = (v: number, unit: string) => {
  if (unit === "원") return v >= 10000 ? `${(v / 10000).toFixed(0)}만` : `${v}`;
  if (unit === "%")  return `${v}%`;
  return v >= 1000   ? `${(v / 1000).toFixed(1)}k` : `${v}`;
};

/* ─── 커스텀 툴팁 ──────────────────────────────── */
const CustomTooltip = ({ active, payload, label, hKey }: any) => {
  if (!active || !payload?.length) return null;
  const items = hKey ? payload.filter((p: any) => p.dataKey === hKey) : payload;
  return (
    <div
      className="px-3.5 py-2.5 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        border: "0.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <p className="text-[10px] tracking-widest text-black/30 mb-2 font-medium uppercase">
        {label}요일
      </p>
      <div className="space-y-1.5">
        {items.map((item: any, i: number) => {
          const meta = METRIC[item.dataKey as MetricKey];
          if (!meta) return null;
          const v = Number(item.value);
          const display =
            meta.unit === "원" ? `₩${v.toLocaleString()}` :
            meta.unit === "%" ? `${v}%` :
            `${v.toLocaleString()}명`;
          return (
            <div key={i} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>{meta.name}</span>
              </div>
              <span className="text-[12px] font-semibold tabular-nums" style={{ color: "rgba(0,0,0,0.8)" }}>
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── 커스텀 라벨 (수치 표시) ──────────────────── */
const DataLabel = ({ x, y, value, unit, color }: any) => {
  if (value == null || value === 0) return null;
  const text = labelFmt(Number(value), unit);
  return (
    <text
      x={x}
      y={y - 6}
      textAnchor="middle"
      fontSize={10}
      fontWeight={600}
      fill={color}
      style={{ pointerEvents: "none" }}
    >
      {text}
    </text>
  );
};

/* ─── 액티브 도트 ──────────────────────────────── */
const ActiveDot = ({ cx, cy, stroke }: any) => (
  <g>
    <circle cx={cx} cy={cy} r={8}  fill={stroke} opacity={0.15} />
    <circle cx={cx} cy={cy} r={4}  fill={stroke} opacity={0.3}  />
    <circle cx={cx} cy={cy} r={2.5} fill="white" stroke={stroke} strokeWidth={1.5} />
  </g>
);

/* ─── 메인 컴포넌트 ─────────────────────────────── */
const WeeklyChart = ({ liveStats, onHoverIndex, hoveredIndex, highlightedKey }: WeeklyChartProps) => {
  const chartData = useMemo(() => [...liveStats].reverse(), [liveStats]);
  const hKey = highlightedKey as MetricKey | null;
  const hMeta = hKey ? METRIC[hKey] : null;

  const yAxisBase = {
    axisLine: false as const,
    tickLine: false as const,
    tick: { fontSize: 10, fill: "rgba(0,0,0,0.3)" },
    width: 42,
  };

  return (
    <div
      className="h-full flex flex-col rounded-[22px]"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* ── 헤더 ── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-medium tracking-tight" style={{ color: "rgba(0,0,0,0.78)" }}>
            주간 방송 추이
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(0,0,0,0.3)" }}>
            {hKey ? `${hMeta?.name} · 7일 상세` : "후원 + 시청자 흐름"}
          </p>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {ALL_KEYS.map((k) => {
            const m = METRIC[k];
            return (
              <div
                key={k}
                className="flex items-center gap-1.5 transition-opacity duration-200"
                style={{ opacity: hKey && hKey !== k ? 0.2 : 1 }}
              >
                <div className="w-3.5 h-[2px] rounded-full" style={{ background: m.color }} />
                <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)" }}>{m.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 차트 ── */}
      <div className="flex-1 min-h-0 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 24, right: 16, left: 0, bottom: 4 }}
            onMouseMove={(s: any) => {
              if (s?.activeTooltipIndex !== undefined) onHoverIndex(s.activeTooltipIndex);
            }}
            onMouseLeave={() => onHoverIndex(null)}
          >
            <defs>
              <linearGradient id="wc_avg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="wc_peak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="wc_total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2dd4bf" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="wc_chat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#fb7185" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#fb7185" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="wc_fund_bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f0c040" stopOpacity={1}   />
                <stop offset="100%" stopColor="#e9a800" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(0,0,0,0.04)" strokeDasharray="0" vertical={false} />

            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "rgba(0,0,0,0.3)", fontWeight: 500 }}
              dy={6}
            />

            {/* Y축 — 시청자 (왼쪽) */}
            {(!hKey || hMeta?.axis === "viewers") && (
              <YAxis {...yAxisBase} yAxisId="viewers" orientation="left"
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
            )}
            {/* Y축 — 후원 (오른쪽) */}
            {(!hKey || hMeta?.axis === "fund") && (
              <YAxis {...yAxisBase} yAxisId="fund" orientation="right"
                tickFormatter={(v) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v)}
              />
            )}
            {/* Y축 — 전환율 */}
            {hKey === "intoChatRate" && (
              <YAxis {...yAxisBase} yAxisId="pct" orientation="left"
                domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              />
            )}

            <Tooltip
              content={<CustomTooltip hKey={hKey} />}
              cursor={{ stroke: "rgba(0,0,0,0.06)", strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            {/* ── 후원 막대 ── */}
            {(!hKey || hKey === "fund") && (
              <Bar
                yAxisId="fund" dataKey="fund" name="후원금액"
                radius={[6, 6, 0, 0]} maxBarSize={28}
                fill="url(#wc_fund_bar)"
                opacity={hKey === "fund" ? 1 : 0.5}
              >
                {hKey === "fund" && (
                  <LabelList
                    dataKey="fund"
                    content={(props: any) => (
                      <DataLabel {...props} unit="원" color={METRIC.fund.color} />
                    )}
                  />
                )}
                {chartData.map((_, i) => (
                  <Cell key={i} opacity={hoveredIndex === i ? 1 : hKey === "fund" ? 0.75 : 0.5} />
                ))}
              </Bar>
            )}

            {/* ── 평균 시청자 에어리어 ── */}
            {(!hKey || hKey === "avgViewer") && (
              <Area
                yAxisId="viewers" type="monotone" dataKey="avgViewer" name="평균 시청자"
                stroke="#38bdf8" strokeWidth={hKey === "avgViewer" ? 2.5 : 1.8}
                fill="url(#wc_avg)" fillOpacity={hKey === "avgViewer" ? 1 : 0.7}
                dot={false} activeDot={<ActiveDot />}
                opacity={hKey && hKey !== "avgViewer" ? 0 : 1}
              >
                {hKey === "avgViewer" && (
                  <LabelList
                    dataKey="avgViewer"
                    content={(props: any) => (
                      <DataLabel {...props} unit="명" color={METRIC.avgViewer.color} />
                    )}
                  />
                )}
              </Area>
            )}

            {/* ── 최고 시청자 에어리어 ── */}
            {(!hKey || hKey === "peakViewers") && (
              <Area
                yAxisId="viewers" type="monotone" dataKey="peakViewers" name="최고 시청자"
                stroke="#a78bfa" strokeWidth={hKey === "peakViewers" ? 2.5 : 1.5}
                strokeDasharray={hKey ? "0" : "5 3"}
                fill="url(#wc_peak)"
                fillOpacity={hKey === "peakViewers" ? 1 : 0}
                dot={false} activeDot={<ActiveDot />}
                opacity={hKey && hKey !== "peakViewers" ? 0 : 1}
              >
                {hKey === "peakViewers" && (
                  <LabelList
                    dataKey="peakViewers"
                    content={(props: any) => (
                      <DataLabel {...props} unit="명" color={METRIC.peakViewers.color} />
                    )}
                  />
                )}
              </Area>
            )}

            {/* ── 총 방문자 에어리어 ── */}
            {(!hKey || hKey === "totalVisitors") && (
              <Area
                yAxisId="viewers" type="monotone" dataKey="totalVisitors" name="총 방문자"
                stroke="#2dd4bf" strokeWidth={hKey === "totalVisitors" ? 2.5 : 1.5}
                fill="url(#wc_total)"
                fillOpacity={hKey === "totalVisitors" ? 1 : 0}
                dot={false} activeDot={<ActiveDot />}
                opacity={hKey && hKey !== "totalVisitors" ? 0 : 1}
              >
                {hKey === "totalVisitors" && (
                  <LabelList
                    dataKey="totalVisitors"
                    content={(props: any) => (
                      <DataLabel {...props} unit="명" color={METRIC.totalVisitors.color} />
                    )}
                  />
                )}
              </Area>
            )}

            {/* ── 채팅 전환율 ── */}
            {(!hKey || hKey === "intoChatRate") && (
              <Area
                yAxisId={hKey === "intoChatRate" ? "pct" : "viewers"}
                type="monotone" dataKey="intoChatRate" name="채팅 전환율"
                stroke="#fb7185" strokeWidth={hKey === "intoChatRate" ? 2.5 : 1.5}
                fill="url(#wc_chat)" fillOpacity={hKey === "intoChatRate" ? 1 : 0}
                dot={false} activeDot={<ActiveDot />}
                opacity={hKey && hKey !== "intoChatRate" ? 0 : 0.9}
              >
                {hKey === "intoChatRate" && (
                  <LabelList
                    dataKey="intoChatRate"
                    content={(props: any) => (
                      <DataLabel {...props} unit="%" color={METRIC.intoChatRate.color} />
                    )}
                  />
                )}
              </Area>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 하단 인디케이터 */}
      <div className="flex-shrink-0 px-6 pb-4 flex justify-center gap-1.5">
        {chartData.map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: hoveredIndex === i ? 24 : 8,
              background: hoveredIndex === i ? "rgba(14,165,233,0.45)" : "rgba(0,0,0,0.08)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default WeeklyChart;
