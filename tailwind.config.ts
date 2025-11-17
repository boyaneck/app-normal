import { MdWidthFull } from "react-icons/md";
import type { Config } from "tailwindcss";
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Tailwind가 CSS를 추출할 파일들
  ],
  theme: {
    extend: {
      colors: {
        main_color: "#69E2FF", // 커스텀 색상을 main_color로 지정
      },
      smoothTransitionForBar: {
        transitionBar: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
      },
      keyframes: {
        "slide-progress-animation": {
          from: { width: "0%" },
          to: { width: "100%" },
        },
        "fade-out-up-animation": {
          from: { opacity: 1, transform: "translateY(0)" },
          to: { opacity: 0, transform: "translateY(-20px)" },
        },
        "money-flap-animation": {
          "0%, 100%": { transform: "rotate(-3deg)" }, // 시작 및 끝: 약간 왼쪽으로 기울임
          "50%": { transform: "rotate(3deg)" }, // 중간: 약간 오른쪽으로 기울임
        },

        "raise-up-bar-animation": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "70%": { transform: "translateY(-5%)", opacity: "1" }, // 살짝 더 올라갔다가
          "100%": { transform: "translateY(0)", opacity: "1" }, // 제자리로
        },
        curtainUp: {
          "0%": { clipPath: "inset(100% 0 0 0)" },
          "20%": { clipPath: "inset(0 0 -10% 0)" },
          "100%": { clipPath: "inset(0 0 5% 0)" },
        },
        curtainDown: {
          "0%": { clipPath: "inset(0 0 -10% 0)" },
          "20%": { clipPath: "inset(0 0 -13% 0" },
          "100%": { clipPath: "isnet(100% 0 0 0" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        revealDown: {
          // 시작: Y축 -100% 위치 (위쪽 화면 밖)에서 시작
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          // 끝: Y축 0 (제자리)으로 내려오면서 나타남
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "heart-wave-animation": {
          "0%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translate(-50%, -150%) scale(1.5)",
            opacity: "0",
          },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        // 오른쪽으로 나가는 애니메이션
        slideOutToRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        revealFromBottom: {
          "0%": { height: "0" },
          "100%": { height: "100%" },
        },
        hideToBottom: {
          "0%": { height: "100%" },
          "100%": { height: "0" },
        },
      },
      animation: {
        "slide-progress": "slide-progress-animation 4000ms linear forwards",
        slideIn: "slideInFromRight 0.3s ease-out forwards",
        slideOut: "slideOutToRight 0.3s ease-in forwards",
        ripple: "ripple 1s cubic-bezier(0, 0, 0.2, 1) infinite",
        "raise-up-bar":
          "raise-up-bar-animation 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards",
        "fade-out-up": "fade-out-up-animation 0.3s ease-out forwards",
        "money-flap": "money-flap-animation 0.2s ease-in-out infinite",
        "heart-wave": "heart-wave-animation 0.8s forwards",
        curtainUp: "curtainUp 0.7s ease-in-out forwards",
        revealDown: "revealDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        revealFromBottom: "revealFromBottom 0.3s ease-in-out forwards",
        hideToBottom: "hideToBottom 0.3s ease-in-out forwards",
      },
    },
  },
};

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
