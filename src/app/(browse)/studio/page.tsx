"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import StudioAIInput from "./_components/studio-AI-input";
import LiveStat from "./live-stat/live-stat";
import useUserStore from "@/store/user";
// const LiveStat = dynamic(() => import("./live-stat/live-stat"));
const LiveSetting = dynamic(() => import("./live-setting/page"));

const StudioPage = () => {
  const { user } = useUserStore();
  console.log("스튜디오에서 현재 호스트의 정보 가져오기 ", user?.userId);
  const TabContents: Record<string, React.ReactNode> = {
    liveStat: <LiveStat roomName={user?.userId} />,
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
        {TabContents[selectTab] || <LiveStat roomName={user?.userId} />}
        <StudioAIInput />
      </div>
    </div>
  );
};

export default StudioPage;
