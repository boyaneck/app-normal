"use client";
import { ForwardedRef, forwardRef } from "react";

interface ObjectProps {
  title: string;
  value: number | undefined | string;
  unit: string;
}

type WeekleyAvgType = [string, ObjectProps];

interface props {
  liveStatCard: WeekleyAvgType;
}

const StatCard = forwardRef(
  ({ liveStatCard }: props, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div className="flex-1 rounded-2xl p-5 bg-white/90 backdrop-blur-xl border border-white shadow-[0_1px_12px_rgba(0,0,0,0.04)] cursor-pointer hover:scale-[1.02] transition-all">
        <h3 className="text-[10px] uppercase tracking-widest text-black/30 mb-2">
          {liveStatCard[1]?.title}
        </h3>
        <div
          className="text-2xl font-semibold text-black/85 tracking-tight"
          ref={ref}
        >
          {liveStatCard[1]?.value}
        </div>
        <span className="text-[11px] text-black/25 mt-1 block">
          {liveStatCard[1]?.unit}
        </span>
      </div>
    );
  },
);

StatCard.displayName = "StatCard";
export default StatCard;
