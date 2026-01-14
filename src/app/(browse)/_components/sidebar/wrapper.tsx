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
        `fixed top-40 ml-2 left-0 h-[500px] w-56 flex flex-col
         bg-white/40 backdrop-blur-2xl 
         border border-white/60
         shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
         z-50 rounded-lg transition-all duration-300 ease-in-out `,

        collapsed && "w-[70px]"
      )}
    >
      {children}

      <div className="border border-black rounded-xl">
        <div className="flex items-center">
          <div className="border border-black rounded-full w-11 h-11 overflow-hidden  ">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
              alt="User"
              className=""
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Wrapper;
