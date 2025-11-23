"use client";
import React from "react";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <div className=" mt-20  h-[calc(100vh-5rem)]">
        <Sidebar />
        {children}
      </div>
    </>
  );
};

export default layout;
