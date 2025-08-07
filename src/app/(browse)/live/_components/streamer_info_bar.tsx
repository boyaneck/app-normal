import React from "react";
import clsx from "clsx";
import { useStreamingBarStore } from "@/store/bar_store";

interface NavItem {
  id: "chat" | "setting" | "streamer";
  icon: React.ReactNode;
}

interface StreamerInfoBarProps {
  show: boolean;
  items: NavItem[];
}

const StreamerInfoBar = ({ show, items }: StreamerInfoBarProps) => {
  const { icon, toggle } = useStreamingBarStore();

  console.log("아이콘 확인하기", icon);
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <div
        className={clsx(
          ` h-8 mb-2 px-4
            bg-white/10
            backdrop-blur-lg
            border border-white/20 rounded-xl
            shadow-lg
            flex items-center justify-center gap-4
            transition-opacity duration-300`,
          {
            // "opacity-100": show,
            "opacity-0": !show,
            "animate-raiseUpBar": show,
          }
        )}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              toggle(item.id);
            }}
            className="hover:cursor-pointer hover:scale-110 transition-transform"
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StreamerInfoBar;
