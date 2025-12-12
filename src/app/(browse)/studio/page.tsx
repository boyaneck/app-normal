"use client";

import React, { useState } from "react";
import StudioMainBanner from "./studio_main_banner";
import ManageViewerPage from "../studio_sidebar/manage_viewer/page";
const StudioPage = () => {
  const [select_menu, set_select_menu] = useState<string>("");
  const onHandlerMenu = (menu: string) => {
    set_select_menu(menu);
  };
  return (
    <div
      className=" border border-red-500 grid grid-cols-10 h-1/2
  "
    >
      <div className="col-span-2">
        <div onClick={() => onHandlerMenu("live_stat")}>라이브 통계</div>
        <div onClick={() => onHandlerMenu("live_setting")}>
          라이브 및 방송 설정
        </div>
        <div onClick={() => onHandlerMenu("analysis")}>분석</div>
        <div onClick={() => onHandlerMenu("notice")}>공지사항</div>
      </div>
      <div className="col-span-8 h-1/2 ">
        <StudioMainBanner selected_menu={select_menu} />
      </div>
    </div>
  );
};

export default StudioPage;
