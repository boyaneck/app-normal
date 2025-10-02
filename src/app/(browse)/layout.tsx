"use client";
import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <div className="pt-10 border border-emerald-100  ">
      <Navbar />
      sssss
      <div className="grid border border-purple">
        {/* <Sidebar /> */}eeeee
        {children}
      </div>
    </div>
  );
};

export default layout;
