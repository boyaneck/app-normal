"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import { easeInOut, motion } from "framer-motion";
import { LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import React from "react";
motion;
interface WrapperProps {
  children: React.ReactNode;
}
const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Security", icon: <ShieldCheck size={20} /> },
  { name: "Settings", icon: <Settings size={20} /> },
];

const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useSidebarStore((state) => state);
  return (
    <motion.aside
      initial={{ width: 70, borderRadius: "50px" }}
      animate={{
        width: collapsed ? [70, 50, 230] : 70,
        borderRadius: collapsed ? "24px" : "50px",
      }}
      transition={{
        duration: 0.5,
        times: [0, 0.4, 1],
        ease: "easeInOut",
      }}
      className={cn(
        `fixed top-40 ml-2 left-4 h-[300px] flex flex-col 
         bg-white/40 backdrop-blur-2xl
         border border-black
         shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
         z-50  `
      )}
    >
      {children}
      <div className="border border-black rounded-xl">
        <div className="flex items-center">
          <div className="border border-black rounded-full w-11 h-11 overflow-visible  ">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
              alt="User"
              className=""
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Wrapper;
