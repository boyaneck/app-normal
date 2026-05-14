"use client";
import useSigninAndLogout from "@/hooks/useSigninAndLogout";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";

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

  const iconBtn = {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(56,189,248,0.1)",
    border: "0.5px solid rgba(56,189,248,0.22)",
    cursor: "pointer",
    transition: "all 0.18s",
    color: "rgba(255,255,255,0.7)",
  } as const;

  if (!isIdentified) {
    return (
      <Link
        href="/signin"
        className="text-[13px] font-medium px-4 py-2 rounded-xl transition-all hover:scale-[1.02]"
        style={{
          background: "rgba(56,189,248,0.12)",
          border: "0.5px solid rgba(56,189,248,0.25)",
          color: "rgba(56,189,248,0.9)",
        }}
      >
        로그인
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* 스튜디오 버튼 */}
      <button
        onClick={() => router.push("/studio")}
        style={iconBtn}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.18)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(56,189,248,0.1)")}
        title="스튜디오"
      >
        {/* 라이브 스트리밍 아이콘 */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14" />
          <rect x="3" y="6" width="12" height="12" rx="2" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/* 유저 아이콘 + 드롭다운 */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          style={{
            ...iconBtn,
            background: dropdownOpen ? "rgba(56,189,248,0.2)" : iconBtn.background,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = dropdownOpen ? "rgba(56,189,248,0.2)" : "rgba(56,189,248,0.1)")}
          title="내 계정"
        >
          {/* 유저 아이콘 */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
          </svg>
        </button>

        {/* 드롭다운 */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-36 rounded-2xl overflow-hidden"
            style={{
              background: "rgba(7,28,46,0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "0.5px solid rgba(56,189,248,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,189,248,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login_authbar;
