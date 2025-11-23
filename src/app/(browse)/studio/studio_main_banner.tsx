// StudioMainBanner.js (예시)
import React from "react";
import ManageViewerPage from "../studio_sidebar/manage_viewer/page";
import AnalyzePage from "../studio_sidebar/analyze/page";
import LiveStat from "./live_stat/live_stat";
import LiveSetting from "./live_setting";
import LiveSettingPage from "./live_setting/page";

interface Props {
  selected_menu: string;
}
const StudioMainBanner = ({ selected_menu }: Props) => {
  let content;

  switch (selected_menu) {
    case "manage_viewer":
      content = (
        <div>
          <ManageViewerPage />
        </div>
      );
      break;
    case "live_stat":
      content = (
        <div>
          라이브 통계
          <LiveStat />
        </div>
      );
      break;
    case "live_setting":
      content = (
        <div>
          라이브 관리 및 방송설정
          <LiveSettingPage />
        </div>
      );
      break;
    case "notice":
      content = <div>공지사항 내용</div>;
      break;
    default:
      content = <div>스튜디오 메인 배너 내용</div>; // 기본 내용
  }

  return (
    <div className="border border-blue-400">
      <div>스튜디오 메인 배너</div>
      {content}
    </div>
  );
};

export default StudioMainBanner;
