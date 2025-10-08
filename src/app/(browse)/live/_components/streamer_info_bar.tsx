import React from "react";
import clsx from "clsx";
<<<<<<< HEAD
import { useStreamingBarStore } from "@/store/bar_store";

interface NavItem {
  id: "chat" | "setting" | "streamer";
=======

interface NavItem {
>>>>>>> f7d6a3a144dd99c98ae75511a136e6fa0f8a82f9
  icon: React.ReactNode;
}

interface StreamerInfoBarProps {
  show: boolean;
  items: NavItem[];
}

const StreamerInfoBar = ({ show, items }: StreamerInfoBarProps) => {
<<<<<<< HEAD
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
=======
  return (
    // 부모를 기준으로 하단 중앙에 위치합니다.
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
      <div
        className={clsx(
          ` h-8 rounded-xl mb-2 px-4
            bg-white/10
            backdrop-blur-lg
            border border-white/20
            shadow-lg
            flex items-center justify-center gap-4
            transition-opacity duration-300`, // 투명도 변경 시 부드러운 전환 효과
          {
            "opacity-100": show, // show가 true일 때 나타남
            "opacity-0": !show, // show가 false일 때 투명해짐
            "animate-raiseUpBar": show, // 나타날 때 올라오는 애니메이션 적용
>>>>>>> f7d6a3a144dd99c98ae75511a136e6fa0f8a82f9
          }
        )}
      >
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={(e) => {
<<<<<<< HEAD
              e.stopPropagation();
              toggle(item.id);
=======
              // 이벤트 버블링을 막아, 부모의 onMouseLeave 등이 실행되지 않게 합니다.
              e.stopPropagation();
>>>>>>> f7d6a3a144dd99c98ae75511a136e6fa0f8a82f9
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
