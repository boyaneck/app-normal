"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar_store";
import React from "react";
interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  const { collapsed } = useSidebarStore((state) => state);
  return (
    <div
      className={cn("flex-1 ", collapsed ? "ml-[70px]" : "ml-[70px] lg:ml-60")}
    >
      {/* Container
      {children} */}
    </div>
  );
};

export default Container;
