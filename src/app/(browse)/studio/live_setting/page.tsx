import React from "react";
import LiveScreen from "./live_screen";
import MetadataSetting from "./metadata_setting";
import NetworkSetting from "./network_setting";
const LiveSettingPage = () => {
  return (
    <div className="grid grid-row-3 gap-2 bg-gray-500">
      <LiveScreen />
      <MetadataSetting />
      <NetworkSetting />
    </div>
  );
};

export default LiveSettingPage;
