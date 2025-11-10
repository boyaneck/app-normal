"use-cient";
import { live_stats_card_props, post_live_stats_props } from "@/types/live";
import { DollarSign, MessageSquare, Repeat } from "lucide-react";
import { ForwardedRef, forwardRef } from "react";

interface object_props {
  title: string;
  value: number | undefined | string;
  unit: string;
}

type weekley_avg_type = [string, object_props];

// interface props {
//   live_stats_card: weekley_avg_type;
//   stat_card_ref: React.RefObject<HTMLDivElement>;
// }
interface props {
  live_stats_card: weekley_avg_type;
}

const StatCard = forwardRef(
  (
    // { live_stats_card, stat_card_ref }: props,
    // ref: ForwardedRef<HTMLDivElement>
    { live_stats_card }: props,
    ref: ForwardedRef<HTMLDivElement>
  ) => {
    return (
      <>
        <div className="w-80 rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between pb-4">
            {/* 제목 */}
            <h3 className="text-base font-semibold  text-gray-700">
              {live_stats_card[1]?.title}
            </h3>
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
              {/* <stat.icon className="h-5 w-5" /> */}
              {/* <IconComponent /> */}
            </div>
          </div>

          <div className="flex flex-col">
            <div
              className="text-4xl font-extrabold text-gray-900"
              // ref={stat_card_ref}
            >
              {live_stats_card[1]?.value}
            </div>

            <div className="mt-2 flex items-center justify-between">
              {/* <span className={`text-sm ${stat.trendColor} font-bold`}> */}
            </div>
            <span className="text-xs text-gray-500"></span>
          </div>
        </div>
      </>
    );
  }
);

export default StatCard;
