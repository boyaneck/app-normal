"use client";

import { useState } from "react";

const nav_items = ["🎬", "💬", "👤", "⚙️"];

const SlidingLiquidBar = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const ITEM_WIDTH = 80; // w-20 -> 5rem -> 80px
  const GAP_WIDTH = 16; // gap-4 -> 1rem -> 16px

  const bubbleXPosition =
    activeIndex !== null ? activeIndex * (ITEM_WIDTH + GAP_WIDTH) : 0;

  return (
    <div
      className="relative flex items-center justify-center gap-4 p-3 
                   rounded-full bg-black/20 backdrop-blur-lg"
    >
      <div
        className="
          absolute top-3 left-3 w-20 h-20
          
          // --- 물방울의 시각적 디테일 ---
          bg-white/20 backdrop-blur-sm
          border-2 border-white/30
          shadow-[inset_0_2px_6px_0_rgba(255,255,255,0.2)]
          rounded-full
          
          // --- 핵심: 상태에 따른 이동과 등장 애니메이션 ---
          transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] // 'easeOutQuint' 곡선
          
          // activeIndex가 null이면 숨김, 아니면 보임
          ${activeIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
        "
        style={{
          transform: `translateX(${bubbleXPosition}px)`,
        }}
      >
        {/* 표면 광택 (하이라이트) */}
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-white/40 to-transparent rounded-full rotate-[-30deg]"></div>
      </div>

      {nav_items.map((icon, index: any) => (
        <button
          key={index}
          onClick={() => setActiveIndex(index)}
          className="
            relative z-10 w-20 h-20 flex items-center justify-center 
            text-white text-3xl
            transition-transform duration-300 ease-out
          "
          // 활성화된 버튼의 아이콘만 살짝 커지게 함
          style={{
            transform: activeIndex === index ? "scale(1.1)" : "scale(1)",
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default SlidingLiquidBar;
