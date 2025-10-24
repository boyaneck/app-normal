import React from "react";

const WeeklyTrendChart = () => {
  return (
    <div
      className={`border border-white/20 shadow-md
        p-4
        bg-white/10 transition-all duration-300 
           rounded-xl min-h-[200px] backdrop-blur-md
        // hover:shadow-xl
        // hover:shadow-indigo-500/50
        //     hover:border-indigo-400/50
    hover:ring-indigo-400/70   // hover 시 ring 색상 (남색/보라색)과 투명도
           `}
    >
      WeeklyTrendChart
    </div>
  );
};

export default WeeklyTrendChart;
