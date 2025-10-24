"use-cient";
import { live_stats_card_props } from "@/types/live";
import { DollarSign, MessageSquare, Repeat } from "lucide-react";

interface props {
  live_stats_card: live_stats_card_props;
}

const StatCard = ({ live_stats_card }: props) => {
  console.log("라이브 통계 카드의 정보", live_stats_card);
  const { icon: IconComponent } = live_stats_card;
  // 이 데이터만 변경하여 다른 통계 카드를 만드세요.

  // const progess_percent = Math.min(
  //   (stat.currentValue / stat.goalValue) * 100,
  //   100
  // );
  return (
    <>
      <div className="w-80 rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between pb-4">
          {/* 제목 */}
          <h3 className="text-base font-semibold  text-gray-700">
            {live_stats_card?.title}
          </h3>
          <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
            {/* <stat.icon className="h-5 w-5" /> */}
            {/* <IconComponent /> */}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-4xl font-extrabold text-gray-900">
            {live_stats_card?.value}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {/* <span className={`text-sm ${stat.trendColor} font-bold`}> */}
            {/* {stat.trend} */}
            {/* </span> */}
            {/* <span className="text-xs text-gray-500">{stat.goalText}</span> */}
          </div>
        </div>
      </div>
      {/* <div className="pt-4">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-amber-500 transition-all duration-700 ease-out"
              // style={{ width: `${progess_percent}%` }}
            ></div>
          </div>
        </div> */}
      {/* <div className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h3 className="text-lg font-bold mb-5 text-gray-800 border-b pb-3">
          주요 참여 및 전환 지표
        </h3>
      </div> */}
    </>
  );
};

export default StatCard;
