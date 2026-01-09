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
      //프로필 섹션
      <div className="px-4 mt-auto">
        <div
          className={`
            flex items-center p-2 rounded-[2rem] transition-all duration-500
            ${
              collapsed
                ? "bg-white/40 border border-white/80 shadow-sm"
                : "justify-center"
            }
          `}
        >
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl blur-sm opacity-40 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-11 h-11 rounded-[1.25rem] overflow-hidden border-2 border-white shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
                alt="User"
                className="bg-white"
              />
            </div>
          </div>
          <div
            className={`ml-4 transition-all duration-500 ${
              collapsed ? "opacity-100 w-32" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            <p className="text-[13px] font-extrabold text-slate-800 truncate leading-tight">
              Sophie Turner
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Premium
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Wrapper;
