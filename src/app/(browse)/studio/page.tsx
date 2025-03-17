"use client";

import React from "react";
import StudioMainBanner from "./studio_main_banner";
import ManageViewerPage from "../studio_sidebar/manage_viewer/page";
const StudioPage = () => {
  return (
    <div className=" border border-black grid grid-cols-3 ">
      <div className="border border-red-300">
        <div>시청자관리</div>
        <div>수익관리</div>
        <div>분석</div>
        <div>공지사항</div>
      </div>
      <StudioMainBanner />
      <div className="border border-green-400">메인컨텐츠</div>
    </div>
  );
};

export default StudioPage;
