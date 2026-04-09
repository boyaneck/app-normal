const AICard = () => {
  return (
    <div className="flex justify-center py-12">
      {/* 카드 */}
      <div
        className="
        relative overflow-hidden
        w-[210px]
        bg-toss-bg
        rounded-[28px]
        border-[2.5px] border-toss-border
        flex flex-col items-center
        px-5 pt-[26px] pb-7
        cursor-pointer
        animate-border-glow
      "
      >
        {/* 빛 스윕 — left 위치 이동이 필요해서 인라인 style 병행 */}
        <div
          className="absolute top-0 w-[55%] h-full pointer-events-none z-10 animate-sweep"
          style={{
            background:
              "linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.85) 50%, transparent 70%)",
          }}
        />

        {/* 상단 라벨 */}
        <p className="text-base font-medium text-toss-blue mb-8 tracking-[0.01em]">
          AI 분석
        </p>

        {/* 아이콘 */}
        <div className="w-[110px] h-[110px] flex items-center justify-center mb-8 animate-icon-float">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            <ellipse
              cx="40"
              cy="52"
              rx="22"
              ry="26"
              fill="#90bbff"
              opacity="0.45"
            />
            <ellipse
              cx="40"
              cy="52"
              rx="15"
              ry="19"
              fill="#5b9eff"
              opacity="0.5"
            />
            <ellipse
              cx="70"
              cy="52"
              rx="22"
              ry="26"
              fill="#1b64da"
              opacity="0.4"
            />
            <ellipse
              cx="70"
              cy="52"
              rx="15"
              ry="19"
              fill="#90bbff"
              opacity="0.45"
            />
            <circle cx="40" cy="40" r="5" fill="#1b64da" opacity="0.85" />
            <circle cx="70" cy="40" r="5" fill="#0d47a1" opacity="0.85" />
            <circle cx="55" cy="66" r="5" fill="#1b64da" opacity="0.85" />
            <line
              x1="40"
              y1="40"
              x2="70"
              y2="40"
              stroke="#5b9eff"
              strokeWidth="1.8"
              opacity="0.7"
            />
            <line
              x1="40"
              y1="40"
              x2="55"
              y2="66"
              stroke="#5b9eff"
              strokeWidth="1.8"
              opacity="0.7"
            />
            <line
              x1="70"
              y1="40"
              x2="55"
              y2="66"
              stroke="#5b9eff"
              strokeWidth="1.8"
              opacity="0.7"
            />
            <circle cx="22" cy="58" r="3.5" fill="#90bbff" opacity="0.6" />
            <circle cx="88" cy="58" r="3.5" fill="#90bbff" opacity="0.6" />
            <circle cx="55" cy="22" r="3.5" fill="#90bbff" opacity="0.6" />
            <line
              x1="40"
              y1="40"
              x2="22"
              y2="58"
              stroke="#90bbff"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="70"
              y1="40"
              x2="88"
              y2="58"
              stroke="#90bbff"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="55"
              y1="22"
              x2="40"
              y2="40"
              stroke="#90bbff"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <line
              x1="55"
              y1="22"
              x2="70"
              y2="40"
              stroke="#90bbff"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <circle cx="40" cy="40" r="2" fill="#fff" opacity="0.8" />
            <circle cx="70" cy="40" r="2" fill="#fff" opacity="0.8" />
            <circle cx="55" cy="66" r="2" fill="#fff" opacity="0.8" />
          </svg>
        </div>

        {/* 구분선 */}
        <div className="w-full h-px bg-toss-light/20 mb-4" />

        {/* 하단 텍스트 */}
        <p className="text-sm font-medium text-toss-blue text-center leading-relaxed mb-1">
          방송 인사이트
          <br />
          AI 분석
        </p>
        <p className="text-xs text-toss-light text-center">대화하며 확인하기</p>
      </div>
    </div>
  );
};
export default AICard;
