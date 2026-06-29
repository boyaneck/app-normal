"use client";

type Props = { answer?: string; isExpanded?: boolean };

const AIAnswer = ({ answer, isExpanded }: Props) => {
  return (
    <div
      className="relative w-full rounded-2xl border border-white/20 backdrop-blur-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.08) 100%)",
        minHeight: isExpanded ? "500px" : undefined,
      }}
    >
      {/* 상단 하이라이트 선 */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="p-6">
        {/* 라벨 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-xs font-semibold text-sky-300 tracking-[0.2em] uppercase">
            AI Response
          </span>
          <span className="ml-auto text-[10px] text-white/30">
            {isExpanded ? "접기" : "펼치기"}
          </span>
        </div>

        {/* 응답 텍스트 */}
        <p className="text-sm text-white/90 leading-loose whitespace-pre-line">
          {answer}
        </p>
      </div>

      {/* 하단 반사 */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default AIAnswer;
