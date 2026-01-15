"use client";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import { motion } from "framer-motion";
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
      initial={false}
      animate={{
        width: collapsed ? 70 : [70, 60, 230],
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 35,
        restDelta: 0.001,
      }}
      className={cn(
        `fixed top-40 ml-2 left-4 h-[300px] w-56 flex flex-col
         bg-white/40 backdrop-blur-2xl
         border border-black
         shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
         z-50 rounded-full transition-all duration-300 ease-in-out `,

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
    </motion.aside>
    // <aside
    //   className={cn(
    //     `fixed top-40 ml-2 left-4 h-[300px] w-56 flex flex-col
    //      bg-white/40 backdrop-blur-2xl
    //      border border-black
    //      shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
    //      z-50 rounded-full transition-all duration-300 ease-in-out `,

    //     collapsed && "w-[70px]"
    //   )}
    // >
    //   {children}

    //   <div className="border border-black rounded-xl">
    //     <div className="flex items-center">
    //       <div className="border border-black rounded-full w-11 h-11 overflow-hidden  ">
    //         <img
    //           src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
    //           alt="User"
    //           className=""
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </aside>
    // <motion.aside
    //   initial={false}
    //   animate={{
    //     // 펼쳐질 때: [현재값, 살짝수축, 목표값] 순서로 배열을 전달
    //     width: collapsed ? 70 : [70, 60, 224],
    //   }}
    //   transition={{
    //     // 튕기지 않고 묵직하게 멈추도록 damping 값을 올림
    //     type: "spring",
    //     stiffness: 250,
    //     damping: 35, // 값을 높여서 튕김(Bounce)을 거의 없앰
    //     restDelta: 0.001,
    //   }}
    //   className={cn(
    //     `fixed top-40 ml-2 left-4 h-[300px] flex flex-col
    //  bg-white/40 backdrop-blur-2xl
    //  border border-black
    //  shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]
    //  z-50 rounded-[40px] overflow-hidden`
    //   )}
    // >
    //   {/* 레이아웃 붕괴 방지용 고정 너비 컨테이너 */}
    //   <div className="min-w-[224px] h-full flex flex-col p-3">
    //     <div className="flex-1 overflow-hidden">{children}</div>

    //     <div className="mt-auto border border-black rounded-2xl p-2 bg-white/30">
    //       <div className="flex items-center">
    //         <div className="border border-black rounded-full w-11 h-11 overflow-hidden shrink-0">
    //           <img
    //             src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie"
    //             alt="User"
    //             className="w-full h-full object-cover"
    //           />
    //         </div>

    //         {/* 텍스트는 사이드바가 일정 수준 넓어진 후에만 보이게 처리 */}
    //         {!collapsed && (
    //           <motion.div
    //             initial={{ opacity: 0 }}
    //             animate={{ opacity: 1 }}
    //             transition={{ delay: 0.1 }} // 살짝 늦게 나타나야 더 고급스러움
    //             className="ml-3 font-bold text-sm truncate"
    //           >
    //             Sophie
    //           </motion.div>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </motion.aside>
  );
};

export default Wrapper;
