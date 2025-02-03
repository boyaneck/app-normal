"use client";

import React from "react";
import StudioMainBanner from "./studio_main_banner";

const StudioPage = () => {
  return (
    <div className=" border border-black grid grid-cols-3 ">
      <div className="border border-red-300">사이드바</div>
      <StudioMainBanner />
      <div className="border border-green-400">메인컨텐츠</div>
    </div>
  );
};

export default StudioPage;
