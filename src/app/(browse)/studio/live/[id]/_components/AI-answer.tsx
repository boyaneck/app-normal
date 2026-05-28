"use client";

type Props = { answer?: string };

const AIAnswer = ({ answer }: Props) => {
  return (
    <div className="relative w-full h-full flex items-end justify-center pb-8 pointer-events-none">
      <div className="relative w-[90%] max-w-xl overflow-hidden rounded-2xl">
        {/* 흐르는 빛 레이어 */}
        <div
          className="absolute inset-0 animate-liquid-shine pointer-events-none z-10 rounded-2xl"
          style={{
            background:
              "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 60%, transparent 80%)",
            backgroundSize: "200% 100%",
          }}
        />

        {/* 유리 본체 */}
        <div
          className="relative z-0 border border-white/25 rounded-2xl backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)",
          }}
        >
          {/* 상단 하이라이트 선 */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* 상단 라벨 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs text-sky-300/90 tracking-widest uppercase">
              AI Response
            </span>
          </div>

          {/* 응답 텍스트 */}
          <p className="text-sm text-white/80 leading-relaxed">
            {answer ?? "마이크를 눌러 질문해보세요"}
          </p>

          {/* 하단 반사 그라디언트 */}
          <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default AIAnswer;