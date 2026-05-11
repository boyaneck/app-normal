import React from "react";
import ThumbUpload from "./thumb-upload";
import TitleAndDescription from "./title-and-desc";
import LiveSettingButton from "./live-setting-button";

const LiveSetting = () => {
  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <TitleAndDescription />
      <ThumbUpload />
      <LiveSettingButton />
    </div>
  );
};

export default LiveSetting;
