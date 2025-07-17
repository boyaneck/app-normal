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

// 2. React.FC 없이, 함수의 인자에 직접 props 타입을 적용합니다.
const StreamerInfoBar = ({ show, items }: StreamerInfoBarProps) => {
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
