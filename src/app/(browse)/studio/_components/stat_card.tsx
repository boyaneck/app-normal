"use-cient";
import { post_live_stats_object, post_live_stats_props } from "@/types/live";
import { DollarSign, MessageSquare, Repeat } from "lucide-react";

const StatCard = (post_live_stats: post_live_stats_object) => {
  // 이 데이터만 변경하여 다른 통계 카드를 만드세요.
  const stat = {
    title: "총 후원 금액",
    value: "₩1,245,000",
    trend: "80%",
    trendColor: "text-amber-500", // 데이터가 긍정적일 때의 강조 색상
    icon: DollarSign,
    goalText: "이번 달 목표 달성",
    goalValue: 1556250,
    currentValue: 1245000,
  };

  const progess_percent = Math.min(
    (stat.currentValue / stat.goalValue) * 100,
    100
  );
  const detailStats = [
    {
      title: "채팅 참여율",
      value: "22.5%",
      trend: "▲ 3.1%",
      trendColor: "text-blue-600",
      barColor: "bg-blue-600", // Progress bar 색상
      icon: MessageSquare,
      goalText: "총 시청자 대비",
      progressValue: 22.5, // 실제 참여율 값 (22.5%)
    },
    {
      title: "구독 전환율",
      value: "1.8%",
      trend: "▲ 0.2%",
      trendColor: "text-pink-600",
      barColor: "bg-pink-600", // Progress bar 색상
      icon: Repeat,
      goalText: "일반 시청자 대비",
      progressValue: 1.8, // 실제 전환율 값 (1.8%)
    },
  ];
  return (
    <>
      <div className="w-80 rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between pb-4">
          {/* 제목 */}
          <h3 className="text-base font-semibold  text-gray-700">
            {stat.title}
          </h3>
          <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
            <stat.icon className="h-5 w-5" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-4xl font-extrabold text-gray-900">
            {stat.value}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className={`text-sm ${stat.trendColor} font-bold`}>
              {stat.trend}
            </span>
            <span className="text-xs text-gray-500">{stat.goalText}</span>
          </div>
        </div>

        <div className="pt-4">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-amber-500 transition-all duration-700 ease-out"
              style={{ width: `${progess_percent}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
        <h3 className="text-lg font-bold mb-5 text-gray-800 border-b pb-3">
          주요 참여 및 전환 지표
        </h3>

        {/* 2개의 지표를 세로로 나열하는 컨테이너 */}
        <div className="space-y-6">
          {detailStats.map((stat, index) => (
            <div key={index} className="flex flex-col space-y-2">
              {/* A. 제목 및 트렌드 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {/* 아이콘: 약간 옅은 배경색으로 미니멀하게 강조 */}
                  <stat.icon className={`h-4 w-4 ${stat.trendColor}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </span>
                </div>

                {/* 트렌드 값 */}
                <span className={`text-xs font-semibold ${stat.trendColor}`}>
                  {stat.trend}
                </span>
              </div>

              {/* B. 메인 값 및 Progress Bar */}
              <div className="flex items-center space-x-4">
                {/* 메인 값 (가장 크게 강조) */}
                <div className="text-3xl font-extrabold text-gray-900 w-1/4">
                  {stat.value}
                </div>

                {/* Progress Bar (가로로 길게 시각화) */}
                <div className="w-3/4">
                  <p className="text-xs text-gray-500 mb-1">{stat.goalText}</p>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${stat.barColor} transition-all duration-700 ease-out`}
                      style={{ width: `${stat.progressValue}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default StatCard;
