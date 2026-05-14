"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const Signin = () => {
  const supabaseForClient = createClientComponentClient();

  const getGoogleSocialLogin = async () => {
    try {
      await supabaseForClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: { access_type: "offline", prompt: "consent" },
          redirectTo: "http://localhost:3000/callback",
        },
      });
    } catch {}
  };

  const getKakaoSocialLogin = async () => {
    try {
      await supabaseForClient.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: "http://localhost:3000/callback" },
      });
    } catch {}
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        background: "linear-gradient(150deg, #071c2e 0%, #0c2540 40%, #081e38 70%, #071828 100%)",
      }}
    >
      {/* 배경 글로우 — sky blue */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(56,189,248,0.14) 0%, rgba(14,165,233,0.05) 55%, transparent 75%)",
        }}
      />
      {/* 하단 딥 블루 뉘앙스 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 92%, rgba(2,132,199,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm px-6">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #0284c7 100%)",
              boxShadow: "0 8px 36px rgba(56,189,248,0.35), 0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              {/* AI 스파클 — 4포인트 별 (Gemini 스타일) */}
              <path
                d="M15 2C14.4 8.2 11.5 11.5 2 15C11.5 18.5 14.4 21.8 15 28C15.6 21.8 18.5 18.5 28 15C18.5 11.5 15.6 8.2 15 2Z"
                fill="white"
                opacity="0.95"
              />
              {/* LIVE 도트 — 우상단 */}
              <circle cx="25" cy="6" r="3.2" fill="white" opacity="0.9" />
              {/* 도트 강조 링 */}
              <circle cx="25" cy="6" r="5" fill="white" opacity="0.15" />
            </svg>
          </div>
          <h1
            className="text-[22px] font-semibold tracking-tight"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            시작하기
          </h1>
          <p
            className="text-[13px] mt-1.5"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            소셜 계정으로 바로 로그인하세요
          </p>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col gap-3">
          {/* Google */}
          <button
            onClick={getGoogleSocialLogin}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span
              className="text-[14px] font-medium flex-1 text-left"
              style={{ color: "rgba(0,0,0,0.8)" }}
            >
              Google로 계속하기
            </span>
          </button>

          {/* Kakao */}
          <button
            onClick={getKakaoSocialLogin}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "#FEE500",
              border: "1px solid rgba(0,0,0,0.04)",
              boxShadow: "0 2px 16px rgba(254,229,0,0.2)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3C6.477 3 2 6.82 2 11.455c0 2.9 1.713 5.453 4.3 6.978l-.96 3.493c-.083.305.261.549.524.367l4.113-2.692c.662.09 1.34.137 2.023.137 5.523 0 10-3.82 10-8.283C22 6.82 17.523 3 12 3z"
                fill="rgba(0,0,0,0.85)"
              />
            </svg>
            <span
              className="text-[14px] font-medium flex-1 text-left"
              style={{ color: "rgba(0,0,0,0.85)" }}
            >
              카카오로 계속하기
            </span>
          </button>
        </div>

        {/* 하단 안내 */}
        <p
          className="text-center text-[11px] mt-8 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의합니다
        </p>
      </div>
    </div>
  );
};

export default Signin;
