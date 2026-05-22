"use client";

const AIAnswer = () => {
  return (
    <div className="relative w-full h-full flex items-end justify-center pb-8 pointer-events-none">
      <div
        className="
          w-[90%] max-w-xl
          rounded-2xl
          border border-white/20
          bg-white/5
          backdrop-blur-md
          shadow-[0_0_24px_rgba(255,255,255,0.05)]
          p-5
        "
      >
        {/* 상단 라벨 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs text-sky-400/80 tracking-widest uppercase">
            AI Response
          </span>
        </div>

        {/* 응답 텍스트 영역 */}
        <p className="text-sm text-white/80 leading-relaxed">
          여기에 AI 응답이 표시됩니다.
        </p>
      </div>
    </div>
  );
};

export default AIAnswer;
