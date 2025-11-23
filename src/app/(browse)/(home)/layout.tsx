"use client";
import React, { useEffect } from "react";
import Navbar from "../_components/navbar";
interface childrenProps {
  children: React.ReactNode;
}
const Layout = ({ children }: childrenProps) => {
  return (
    // <div className="h-full border border-blue-500">
    //   {/* <Navbar /> */}
    //   {children}
    //   홈화면의 라이브중인 사람들의 목록 Layout
    // </div>
    <div className="h-2/3 ">
      {/* <Navbar /> */}
      {children}
      홈화면의 라이브중인 사람들의 목록 Layout
    </div>
  );
};

export default Layout;
