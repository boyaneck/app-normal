"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import React from "react";

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useSidebarStore((state) => state);
  return (
    <aside
      className={cn(
        "fixed top-40 ml-2 left-0 h-[500px] w-56 flex flex-col bg-gray-100 z-50 rounded-lg transition-all duration-300 ease-in-out ",
        collapsed && "w-[70px]"
      )}
    >
      {children}
    </aside>
  );
};

export default Wrapper;
