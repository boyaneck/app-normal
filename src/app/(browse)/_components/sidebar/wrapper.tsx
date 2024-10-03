"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar_store";
import React from "react";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useSidebarStore((state) => state);
  return (
    <aside
      className={cn(
        "sticky fixed top-40 ml-10 left-0 h-[500px] w-60 flex flex-col bg-sky-400 border border-red-400 z-50 rounded-lg",
        collapsed && "w-[70px]"
      )}
    >
      {children}
    </aside>
  );
};

export default Wrapper;
