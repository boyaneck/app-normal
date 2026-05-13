"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

interface Props {
  children: React.ReactNode;
}

const layout = ({ children }: Props) => {
  const pathname = usePathname();
  const isAuthPage = pathname === "/signin" || pathname === "/login";
  const isHomePage = pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isHomePage) {
    return (
      <>
        <Navbar />
        <div className="mt-20 h-[calc(100vh-5rem)]">
          {children}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-20 h-[calc(100vh-5rem)]">
        <Sidebar />
        {children}
      </div>
    </>
  );
};

export default layout;
