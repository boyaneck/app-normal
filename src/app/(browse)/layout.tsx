import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div className="pt-28 border border-purple-600 bg-black">
      {/* <Navbar /> */}
      <Sidebar />
      {children}
      홈화면 레이아웃 개꿀ㅁ너ㅣㅏㅓ미어ㅣㅏㄴ머인머ㅣㅏ머아ㅣ
    </div>
  );
};

export default layout;
