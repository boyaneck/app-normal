// 파일 경로: /src/components/RippleButton.jsx (예시)

// 재사용성을 위해 아이콘을 children으로 받습니다.
const Alarm = ({ children }: any) => {
  return (
    <div className="relative group flex items-center justify-center">
      <div
        className="absolute w-12 h-12 rounded-full opacity-0 bg-white/50 
                     group-hover:animate-ripple"
      ></div>
      <div
        className="absolute w-12 h-12 rounded-full opacity-0 bg-white/50 
                     group-hover:animate-ripple [animation-delay:0.3s]"
      ></div>
      <div
        className="absolute w-12 h-12 rounded-full opacity-0 bg-white/50 
                     group-hover:animate-ripple [animation-delay:0.6s]"
      ></div>

      <button
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center 
                       bg-white/10 
                       transition-all duration-300 
                       group-hover:bg-white/20 group-hover:scale-110"
      >
        {children}
      </button>
    </div>
  );
};

export default Alarm;
