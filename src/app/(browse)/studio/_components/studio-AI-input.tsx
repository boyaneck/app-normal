"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

interface Props {
  username?: string;
  onSend?: (text: string) => void;
}

export const StudioAIInput = ({ username = "호스트 님", onSend }: Props) => {
  const [phase, setPhase] = useState("square");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("expand"), 600),
      setTimeout(() => setPhase("text"), 1100),
      setTimeout(() => setPhase("hideText"), 3000),
      setTimeout(() => setPhase("shrink"), 3400),
      setTimeout(() => setPhase("moveBottom"), 4200),
      setTimeout(() => setPhase("input"), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !onSend) return;
    onSend(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const boxAnimate: Record<string, any> = {
    square: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    expand: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    text: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    hideText: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    shrink: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    moveBottom: { width: 48, height: 48, borderRadius: 12, top: "calc(100vh - 72px)", y: "0%" },
    input: { width: 360, height: 48, borderRadius: 24, top: "calc(100vh - 72px)", y: "0%" },
  };

  const current = boxAnimate[phase] ?? boxAnimate.moveBottom;
  const showText = phase === "text" || phase === "expand";
  const iconCenter = phase === "square" || phase === "shrink" || phase === "moveBottom";

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed z-50 left-1/2 flex items-center overflow-hidden"
      style={{
        pointerEvents: phase === "input" ? "auto" : "none",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        x: "-50%",
        willChange: "width, height, top, border-radius",
      }}
      initial={{ width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%", opacity: 0 }}
      animate={{ ...current, opacity: 1 }}
      transition={{
        width: { duration: 0.6, ease: EASE },
        height: { duration: 0.5, ease: EASE },
        borderRadius: { duration: 0.5 },
        top: { duration: 0.7, ease: EASE },
        y: { duration: 0.7, ease: EASE },
        opacity: { duration: 0.25 },
      }}
    >
      {/* AI 아이콘 */}
      <motion.div
        className="absolute flex items-center justify-center"
        animate={{ left: iconCenter ? "calc(50% - 14px)" : 14 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c6aff, #5b4adf)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {/* 환영 텍스트 */}
        {showText && (
          <motion.div
            style={{ marginLeft: 50, display: "flex", gap: 0, whiteSpace: "nowrap" }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {`${username}님 안녕하세요`.split("").map((text, i) => (
              <div key={i} style={{ overflow: "hidden", height: 20, width: "auto" }}>
                <motion.span
                  className="text-sm font-medium"
                  style={{ color: "#1a1a2e", display: "block" }}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ y: { duration: 0.25, delay: i * 0.03, ease: EASE }, opacity: { duration: 0.01, delay: i * 0.03 } }}
                >
                  {text === " " ? "\u00A0" : text}
                </motion.span>
              </div>
            ))}
          </motion.div>
        )}

        {/* 입력 영역 */}
        {phase === "input" && (
          <motion.div
            className="flex items-center"
            style={{ marginLeft: 50, flex: 1, marginRight: 8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AI에게 무엇이든 물어보세요..."
              autoFocus
              className="text-sm flex-1 outline-none bg-transparent"
              style={{ color: "#1a1a2e" }}
            />
            {inputValue.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={handleSend}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-1"
                style={{ background: "linear-gradient(135deg, #7c6aff, #5b4adf)" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudioAIInput;
