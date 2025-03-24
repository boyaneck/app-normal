import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div className="pt-28 border border-emerald-100  ">
      {/* <Navbar /> */}

      <div className="grid border border-purple">
        {/* <Sidebar /> */}
        {children}
        홈화면 레이아웃 개꿀ㅁ너ㅣㅏㅓ미어ㅣㅏㄴ머인머ㅣㅏ머아ㅣ
      </div>
    </div>
  );
};

export default layout;
