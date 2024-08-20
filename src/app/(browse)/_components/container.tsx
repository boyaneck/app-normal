"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar_store";
import React, { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
interface ContainerProps {
  children: React.ReactNode;
}

const Container = ({ children }: ContainerProps) => {
  const { collapsed } = useSidebarStore((state) => state);
  const matches = useMedia;
  return (
    <div
      className={cn("flex-1", collapsed ? "ml-[70px]" : "ml-[70px] lg:ml-60")}
    >
      Container
      {children}
    </div>
  );
};

export default Container;
