"use client";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/store/bar_store";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const ToggleButton = () => {
  const { collapsed, onCollapse, onExpand } = useSidebarStore((state) => state);

  return (
    <div className="absolute top-1/2 -translate-y-1/2 -right-4 z-[60]">
      <Button
        onClick={collapsed ? onExpand : onCollapse}
        className="h-8 w-8 rounded-full border border-black bg-white p-0 flex items-center justify-center hover:bg-gray-100 shadow-md relative overflow-hidden"
      >
        {/* mode="wait"를 제거하여 두 아이콘이 겹치면서 전환되게 함 (깜빡임 방지) */}
        <AnimatePresence>
          <motion.div
            // collapsed 상태에 따라 key를 바꿔서 애니메이션 트리거
            key={collapsed ? "expanded" : "collapsed"}
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
            // 사이드바 애니메이션 시간(0.5s)에 맞춰 지연 시간을 조절
            transition={{
              duration: 0.3,
              delay: 0.35, // 거의 다 펴졌을 때 교체 시작
            }}
            className="absolute" // 두 아이콘을 같은 자리에 겹치게 함
          >
            {collapsed ? (
              <FaArrowLeftLong className="h-4 w-4 text-black" />
            ) : (
              <FaArrowRightLong className="h-4 w-4 text-black" />
            )}
          </motion.div>
        </AnimatePresence>
      </Button>
    </div>
  );
};

export default ToggleButton;
