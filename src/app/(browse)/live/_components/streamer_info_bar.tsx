import React from "react";
import clsx from "clsx";

// 1. 컴포넌트가 받을 props의 타입을 명시적으로 정의합니다.
//    - 아이콘 데이터의 타입
interface NavItem {
  icon: React.ReactNode; // 아이콘은 React 컴포넌트(JSX)이므로 React.ReactNode 타입을 사용합니다.
}

//    - StreamerInfoBar 컴포넌트 전체의 props 타입
interface StreamerInfoBarProps {
  show: boolean;
  items: NavItem[];
}

const StreamerInfoBar = ({ show, items }: StreamerInfoBarProps) => {
  return (
    // 부모를 기준으로 하단 중앙에 위치합니다.
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
              // 이벤트 버블링을 막아, 부모의 onMouseLeave 등이 실행되지 않게 합니다.
              e.stopPropagation();
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
