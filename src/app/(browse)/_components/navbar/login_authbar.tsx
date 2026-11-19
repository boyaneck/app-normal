"use client";
import useSigninAndLogout from "@/hooks/useSigninAndLogout";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect, ReactNode } from "react";
import {
  IoLogOutOutline,
  IoPersonCircleOutline,
  IoPersonCircleSharp,
  IoVideocamOutline,
  IoVideocamSharp,
} from "react-icons/io5";

/**
 * 헤더 아이콘 버튼 (스튜디오 사이드바의 "설정" 버튼과 같은 형태)
 * - 평소: 반투명 유리 원형 + 외곽선 아이콘
 * - hover / 활성: 거의 불투명한 흰 유리 + 채워진 아이콘
 * - 아래쪽 툴팁으로 버튼 이름 표시
 */
const GlassIconButton = ({
  label,
  iconOutline,
  iconSharp,
  active = false,
  onClick,
}: {
  label: string;
  iconOutline: ReactNode;
  iconSharp: ReactNode;
  active?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="group relative flex items-center justify-center"
  >
    {/* 유리 원형: 투명한 배경 + 블러 + 얇은 흰 테두리 + 위쪽 빛 반사 */}
    <div
      className={`relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center
        backdrop-blur-xl backdrop-saturate-150 border transition-all duration-300 group-hover:scale-105
        shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(255,255,255,0.1)]
        ${
          active
            ? "bg-white/50 border-white/60"
            : "bg-white/[0.12] border-white/30 group-hover:bg-white/50 group-hover:border-white/60"
        }`}
    >
      {/* 유리 표면 광택 (위쪽이 밝고 아래로 갈수록 투명) */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-white/5 to-transparent" />

      {/* 평소: 회색 실선 아이콘 / hover·활성: 검은색으로 채워진 아이콘 */}
      <span
        className={`relative transition-colors duration-200 ${
          active ? "hidden" : "block text-gray-400 group-hover:hidden"
        }`}
      >
        {iconOutline}
      </span>
      <span className={`relative text-black ${active ? "block" : "hidden group-hover:block"}`}>
        {iconSharp}
      </span>
    </div>

    {/* 툴팁 (헤더라서 버튼 아래쪽) */}
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <div className="px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium text-white bg-black/80 backdrop-blur shadow-lg">
        {label}
      </div>
    </div>
  </button>
);

const Login_authbar = () => {
  const supabaseForClient = createClientComponentClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isIdentified, setIsIdentified } = useSigninAndLogout();
  const router = useRouter();

  const signOut = () => {
    supabaseForClient.auth.signOut();
    setIsIdentified(false);
    setDropdownOpen(false);
    router.push("/");
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 비로그인: 유저 아이콘 버튼 → 로그인 페이지
  if (!isIdentified) {
    return (
      <GlassIconButton
        label="로그인"
        iconOutline={<IoPersonCircleOutline size={22} />}
        iconSharp={<IoPersonCircleSharp size={22} />}
        onClick={() => router.push("/signin")}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <GlassIconButton
        label="스튜디오"
        iconOutline={<IoVideocamOutline size={20} />}
        iconSharp={<IoVideocamSharp size={20} />}
        onClick={() => router.push("/studio")}
      />

      {/* 로그인 상태: 유저 아이콘 + 드롭다운 */}
      <div className="relative" ref={dropdownRef}>
        <GlassIconButton
          label="내 계정"
          iconOutline={<IoPersonCircleOutline size={22} />}
          iconSharp={<IoPersonCircleSharp size={22} />}
          active={dropdownOpen}
          onClick={() => setDropdownOpen((prev) => !prev)}
        />

        {dropdownOpen && (
          <div className="absolute right-0 mt-3 w-36 rounded-2xl overflow-hidden bg-white/[0.08] border border-white/25 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.3)]">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-white/85 transition-colors hover:bg-white/15"
            >
              <IoLogOutOutline size={16} />
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login_authbar;
