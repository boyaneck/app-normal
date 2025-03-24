// StudioMainBanner.js (예시)
import React from "react";
import ManageRevenuePage from "../studio_sidebar/manage_revenue/page";
import ManageViewerPage from "../studio_sidebar/manage_viewer/page";
import AnalyzePage from "../studio_sidebar/analyze/page";

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
    case "manage_revenue":
      content = (
        <div>
          수익관리
          <ManageRevenuePage></ManageRevenuePage>
        </div>
      );
      break;
    case "analysis":
      content = (
        <div>
          <AnalyzePage />
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
