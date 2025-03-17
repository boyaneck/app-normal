"use client";

import React, { useState } from "react";
import StudioMainBanner from "./studio_main_banner";
import ManageViewerPage from "../studio_sidebar/manage_viewer/page";

const StudioPage = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleMenuClick = (menu: any) => {
    setSelectedMenu(menu);
  };

  return (
    <div className=" border border-black grid grid-cols-3 ">
      <div className="border border-red-300">
        <div
          className="cursor-pointer hover:bg-gray-100 p-2"
          onClick={() => handleMenuClick("viewer")}
        >
          시청자관리
        </div>
        <div
          className="cursor-pointer hover:bg-gray-100 p-2"
          onClick={() => handleMenuClick("revenue")}
        >
          수익관리
        </div>
        <div
          className="cursor-pointer hover:bg-gray-100 p-2"
          onClick={() => handleMenuClick("analytics")}
        >
          분석
        </div>
        <div
          className="cursor-pointer hover:bg-gray-100 p-2"
          onClick={() => handleMenuClick("notice")}
        >
          공지사항
        </div>
      </div>
      <StudioMainBanner />
      <div className="border border-green-400">
        {selectedMenu === "viewer" ? (
          <ManageViewerPage />
        ) : (
          <div>메인컨텐츠</div>
        )}
      </div>
    </div>
  );
};

export default StudioPage;
