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
    <div className=" border border-black grid grid-cols-10 ">
      <div className="col-span-2">
        <div onClick={() => onHandlerMenu("live_stat")}>라이브 통계</div>
        <div onClick={() => onHandlerMenu("manage_viewer")}>시청자관리</div>
        <div onClick={() => onHandlerMenu("analysis")}>분석</div>
        <div onClick={() => onHandlerMenu("notice")}>공지사항</div>
      </div>
      <div className="col-span-8">
        <div>
          <StudioMainBanner selected_menu={select_menu} />
        </div>
      </div>
    </div>
  );
};

export default StudioPage;
