"use client";
interface RetentionRateProps {
  totalVisitors: number;
  stayedViewers: number;
  retentionRate: number;
}

const getLevel = (rate: number) => {
  if (rate >= 70)
    return {
      label: "우수",
      barColor: "linear-gradient(90deg, #34d399, #059669)",
      badge: "bg-emerald-500/10 text-emerald-800/85 border-emerald-400/30",
      insight: "bg-emerald-500/[0.07] border-emerald-400/20 text-black/50",
      stayedColor: "text-emerald-700/80",
      insightText: `시청자 10명 중 ${Math.round(rate / 10)}명이 1분 이상 머물렀어요. 콘텐츠 초반 흡입력이 높습니다.`,
    };
  if (rate >= 45)
    return {
      label: "보통",
      barColor: "linear-gradient(90deg, #fbbf24, #f59e0b)",
      badge: "bg-amber-400/10 text-amber-800/85 border-amber-400/30",
      insight: "bg-amber-400/[0.07] border-amber-400/20 text-black/50",
      stayedColor: "text-amber-700/80",
      insightText:
        "절반 정도가 유지됐어요. 방송 시작 후 첫 2분 구성을 강화하면 유지율을 높일 수 있어요.",
    };
  return {
    label: "개선 필요",
    barColor: "linear-gradient(90deg, #f87171, #ef4444)",
    badge: "bg-red-400/10 text-red-800/85 border-red-400/30",
    insight: "bg-red-400/[0.07] border-red-400/20 text-black/50",
    stayedColor: "text-red-700/80",
    insightText:
      "시청자 이탈이 빠릅니다. 인트로 구성 또는 썸네일·제목을 점검해보세요.",
  };
};

const RetentionRate = ({
  totalVisitors,
  stayedViewers,
  retentionRate,
}: RetentionRateProps) => {
  // retentionRate가 0~1 소수로 오면 *100, 이미 %이면 그대로
  const ratePercent =
    retentionRate <= 1
      ? Math.round(retentionRate * 100)
      : Math.round(retentionRate);
  const leftViewers = totalVisitors - stayedViewers;
  const level = getLevel(ratePercent);

  return (
    <div
      className="rounded-[22px] p-6"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.08)",
        boxShadow:
          "0 2px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[13px] font-medium text-black/75 tracking-tight">
            시청자 유지율
          </div>
          <div className="text-[10px] text-black/28 mt-0.5">
            1분 이상 시청한 비율 · 오늘 방송
          </div>
        </div>
        <span
          className={`text-[10px] font-medium rounded-full px-2.5 py-1 border ${level.badge}`}
        >
          {level.label}
        </span>
      </div>

      {/* 메인 */}
      <div className="flex items-center gap-8">
        {/* 수치 */}
        <div className="flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-[52px] font-medium leading-none tracking-[-0.04em] text-black/85">
              {ratePercent}
            </span>
            <span className="text-[20px] text-black/30 mb-1">%</span>
          </div>
          <div className="flex gap-5 mt-3">
            {[
              { label: "총 방문자", value: totalVisitors },
              { label: "1분+ 시청", value: stayedViewers },
              { label: "이탈", value: leftViewers },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex gap-5">
                <div>
                  <div className="text-[10px] text-black/28 mb-0.5">
                    {item.label}
                  </div>
                  <div className="text-[14px] font-medium text-black/70">
                    {item.value.toLocaleString()}명
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-px bg-black/8 self-stretch" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 바 + 인사이트 */}
        <div className="flex-1 min-w-0">
          {/* 총 방문자 바 */}
          <div className="mb-2.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-black/30">총 방문자</span>
              <span className="text-[10px] text-black/40 font-medium">
                {totalVisitors.toLocaleString()}명
              </span>
            </div>
            <div className="h-2 bg-black/5 rounded-full">
              <div className="h-full w-full bg-black/10 rounded-full" />
            </div>
          </div>

          {/* 유지율 바 */}
          <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-black/30">1분+ 유지</span>
              <span className={`text-[10px] font-medium ${level.stayedColor}`}>
                {stayedViewers.toLocaleString()}명
              </span>
            </div>
            <div className="h-2 bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${ratePercent}%`,
                  background: level.barColor,
                }}
              />
            </div>
          </div>

          {/* 인사이트 */}
          <div
            className={`px-3 py-2.5 rounded-[10px] border text-[11px] leading-relaxed ${level.insight}`}
          >
            {level.insightText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetentionRate;
