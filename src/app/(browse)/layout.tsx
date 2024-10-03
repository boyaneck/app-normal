import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div className="mt-[600px] pt-20 border border-red-400">
      {/* <Navbar /> */}
      <Sidebar />
      {children}
      홈화면 레이아웃 개꿀ㅁ너ㅣㅏㅓ미어ㅣㅏㄴ머인머ㅣㅏ머아ㅣ
    </div>
  );
};

export default layout;
