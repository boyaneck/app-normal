import React from "react";

const stat2_card = () => {
  const detailStats = [
    {
      title: "채팅 참여율",
      value: "22.5%",
      trend: "▲ 3.1%",
      trendColor: "text-blue-600",
      barColor: "bg-blue-600", // Progress bar 색상
      goalText: "총 시청자 대비",
      progressValue: 22.5, // 실제 참여율 값 (22.5%)
    },
    {
      title: "구독 전환율",
      value: "1.8%",
      trend: "▲ 0.2%",
      trendColor: "text-pink-600",
      barColor: "bg-pink-600", // Progress bar 색상
      goalText: "일반 시청자 대비",
      progressValue: 1.8, // 실제 전환율 값 (1.8%)
    },
  ];
  return (
    <div>
      {" "}
      {/* 2개의 지표를 세로로 나열하는 컨테이너 */}
      <div className="space-y-6">
        {detailStats.map((stat, index) => (
          <div key={index} className="flex flex-col space-y-2">
            {/* A. 제목 및 트렌드 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* 아이콘: 약간 옅은 배경색으로 미니멀하게 강조 */}
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
  );
};

export default stat2_card;
