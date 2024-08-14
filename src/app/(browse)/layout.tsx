import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div>
      <Navbar />
      <Sidebar />
      {children}
      홈화면 레이아웃
    </div>
  );
};

export default layout;
