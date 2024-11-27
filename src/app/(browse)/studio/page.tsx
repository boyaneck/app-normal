"use client";

import React from "react";
import StudioMainBanner from "./studio_main_banner";
import Live_Player from "../_components/live_screen/live_player";

const StudioPage = () => {
  return (
    <div className=" border border-black ">
      스튜디오페이지
      <StudioMainBanner />
      <Live_Player user="jinxx93@naver.com" stream="" is_following={[""]} />
    </div>
  );
};

export default StudioPage;
