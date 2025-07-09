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

      keyframes: {
        fadeOutUp: {
          from: { opacity: 1, transform: "translateY(0)" },
          to: { opacity: 0, transform: "translateY(-20px)" },
        },
        moneyFlap: {
          "0%, 100%": { transform: "rotate(-3deg)" }, // 시작 및 끝: 약간 왼쪽으로 기울임
          "50%": { transform: "rotate(3deg)" }, // 중간: 약간 오른쪽으로 기울임
        },

        curtainUp: {
          "0%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(5%)" },
          "100%": { transform: "translateY(-20%}" },
        },
        heartWave: {
          "0%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translate(-50%, -150%) scale(1.5)",
            opacity: "0",
          },
        },
      },
      animation: {
        fadeOutUp: "fadeOutUp 0.3s ease-out forwards",
        moneyFlap: "moneyFlap 0.2s ease-in-out infinite",
        // heartWave: 'heartWave 0.8s linear forwards',
        heartWave: "heartWave 0.8s forwards",
        // curtainUp: "curatainUp 0.7s ease-in-out forwards",
        curtainUp: "curtainUp 0.7s ease-in-out forwards",
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
