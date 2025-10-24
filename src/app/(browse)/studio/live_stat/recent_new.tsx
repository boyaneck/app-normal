import React from "react";

const RecentNews = () => {
  return (
    <div
      className={`border border-white/20 shadow-md
        p-4
        bg-white/10 transition-all duration-300 
           rounded-xl min-h-[200px] backdrop-blur-md
         hover:cursor-pointer
         hover:scale-[1.01]
         hover:shadow-xl`}
    >
      <h2 className="text-lg font-bold text-left mb-6 text-white">
        RecentNews
      </h2>
      <div className="">
        <div
          className="flex justify-between
        border-b border-white 
        "
        >
          <div className="text-left leading-snug ">
            <p className="text-base font-normal">
              New Subscriber: <span className="font-medium">Alex</span>
            </p>
          </div>
          <div className="text-2xl ml-4">😀</div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="">
          <p className="">
            Top cheerer :<span>누가 얼마 </span>
          </p>
        </div>
        <div className="text-2xl ml-4">💸</div>
      </div>
    </div>
  );
};

export default RecentNews;
