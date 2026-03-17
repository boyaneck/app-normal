"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import StudioAIWelcome from "./_components/studio-AI-welcome";
const LiveStat = dynamic(() => import("./live_stat/live_stat"));
import LiveSetting from "./live_setting/page";
import LiveSettingPage from "./live_setting/page";

const StudioPage = () => {
  const TabContents: Record<string, React.ReactNode> = {
    liveStat: <LiveStat />,
    liveSetting: <LiveSetting />,
  };
  const [selectTab, setSelectTab] = useState<string>("");
  const switchTab = (menu: string) => {
    setSelectTab(menu);
  };
  return (
    <div
      className=" border border-red-500 grid grid-cols-10 h-1/2
  "
    >
      <div className="col-span-2">
        {Object.keys(TabContents).map((key) => (
          <div key={key} onClick={() => switchTab(key)}>
            {key}
          </div>
        ))}
      </div>
      <div className="col-span-8 h-1/2 ">
        {TabContents[selectTab] || <LiveStat />}
        <StudioAIWelcome />
      </div>
    </div>
  );
};

export default StudioPage;
