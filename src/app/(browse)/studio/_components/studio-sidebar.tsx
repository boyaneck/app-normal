"use client";

import { motion } from "framer-motion";
import { IoStatsChartOutline, IoStatsChartSharp, IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";

const TABS = [
  {
    key: "liveStat",
    label: "통계",
    iconOutline: <IoStatsChartOutline size={20} />,
    iconSharp: <IoStatsChartSharp size={20} />,
  },
  {
    key: "liveSetting",
    label: "설정",
    iconOutline: <IoSettingsOutline size={20} />,
    iconSharp: <IoSettingsSharp size={20} />,
  },
];

interface StudioSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedCardIndex: number | null;
  onBack: () => void;
}

const StudioSidebar = ({ activeTab, onTabChange, selectedCardIndex, onBack }: StudioSidebarProps) => {
  return (
    <div
      className={`w-[100px] ml-[60px] shrink-0 flex flex-col items-center ${
        selectedCardIndex !== null ? "pt-6" : "pt-20"
      }`}
    >
      {/* 뒤로가기 버튼 or 고정 spacer */}
      {selectedCardIndex !== null ? (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg text-black/60 bg-white/85 border border-white/90 shadow-md transition-all hover:scale-105"
        >
          ←
        </button>
      ) : (
        <div className="w-10 h-10 shrink-0" />
      )}

      {/* 탭 아이콘들 */}
      <div className="flex flex-col items-center gap-5 mt-[150px]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="group relative flex items-center"
            >
              {/* 아이콘 원형 버튼 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-white/90 border border-white/95 shadow-md"
                    : "bg-white/10 border border-white/30"
                }`}
              >
                <span className={isActive ? "hidden" : "block group-hover:hidden"}>
                  {tab.iconOutline}
                </span>
                <span className={isActive ? "block" : "hidden group-hover:block"}>
                  {tab.iconSharp}
                </span>
              </div>

              {/* 툴팁 */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium text-white bg-black/80 backdrop-blur shadow-lg">
                  {tab.label}
                </div>
                {/* 화살표 — CSS 삼각형, Tailwind 불가 */}
                <div
                  className="absolute right-full top-1/2 -translate-y-1/2"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderRight: "5px solid rgba(0,0,0,0.8)",
                  }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StudioSidebar;
