"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

interface Props {
  username?: string;
  onSend?: (text: string) => void;
}

export const StudioAIInput = ({ username = "호스트 님", onSend }: Props) => {
  const [greetingPhase, setGreetingPhase] = useState<
    "square" | "expand" | "text" | "hideText" | "shrink" | "done"
  >("square");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timers = [
      setTimeout(() => setGreetingPhase("expand"), 600),
      setTimeout(() => setGreetingPhase("text"), 1100),
      setTimeout(() => setGreetingPhase("hideText"), 3000),
      setTimeout(() => setGreetingPhase("shrink"), 3200),
      setTimeout(() => setGreetingPhase("done"), 3600),
      setTimeout(() => setShowInput(true), 3700),
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

  const greetingAnimate: Record<string, any> = {
    square: { width: 48, height: 48, borderRadius: 12, y: "-50%" },
    expand: { width: 360, height: 52, borderRadius: 26, y: "-50%" },
    text: { width: 360, height: 52, borderRadius: 26, y: "-50%" },
    hideText: { width: 360, height: 52, borderRadius: 26, y: "-50%" },
    shrink: { width: 0, height: 52, borderRadius: 26, y: "-50%", opacity: 0 },
  };

  const iconCenter = greetingPhase === "square";
  const iconHidden = greetingPhase === "shrink" || greetingPhase === "done";

  const showText = greetingPhase === "expand" || greetingPhase === "text";

  return (
    <>
      {/* ── 인사 애니메이션 (중앙 고정, done이 되면 exit) ── */}
      <AnimatePresence>
        {greetingPhase !== "done" && (
          <motion.div
            className="fixed z-50 left-1/2 top-1/2 flex items-center overflow-hidden"
            style={{
              pointerEvents: "none",
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              x: "-50%",
            }}
            initial={{
              width: 48,
              height: 48,
              borderRadius: 12,
              y: "-50%",
              opacity: 0,
            }}
            animate={{ ...greetingAnimate[greetingPhase], opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{
              width: { duration: 0.3, ease: [0.4, 0, 1, 1] },
              height: { duration: 0.3, ease: EASE },
              borderRadius: { duration: 0.3 },
              opacity: { duration: 0.1, delay: 0.22 },
            }}
          >
            {/* AI 아이콘 */}
            <motion.div
              className="absolute flex items-center justify-center"
              animate={{
                left: iconCenter ? "calc(50% - 14px)" : 14,
                opacity: iconHidden ? 0 : 1,
              }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c6aff, #5b4adf)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </motion.div>

            {/* 환영 텍스트 */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  style={{
                    marginLeft: 50,
                    display: "flex",
                    gap: 0,
                    whiteSpace: "nowrap",
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  {`${username}님 안녕하세요`.split("").map((char, i) => (
                    <div key={i} style={{ overflow: "hidden", height: 20 }}>
                      <motion.span
                        className="text-sm font-medium"
                        style={{ color: "#1a1a2e", display: "block" }}
                        initial={{ y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                          y: { duration: 0.25, delay: i * 0.03, ease: EASE },
                          opacity: { duration: 0.01, delay: i * 0.03 },
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </motion.span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 입력창 (하단 고정, 인사가 끝난 후 독립적으로 등장) ── */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            className="fixed z-50 left-1/2 flex items-center overflow-hidden"
            style={{
              bottom: 20,
              width: 360,
              height: 48,
              borderRadius: 24,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              x: "-50%",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {/* AI 아이콘 */}
            <div className="absolute left-[14px] flex items-center justify-center">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7c6aff, #5b4adf)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            {/* 입력 영역 */}
            <motion.div
              className="flex items-center"
              style={{ marginLeft: 50, flex: 1, marginRight: 8 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="AI에게 무엇이든 물어보세요..."
                autoFocus
                className="text-sm flex-1 outline-none bg-transparent #1a1a2e"
              />
              <AnimatePresence>
                {inputValue.trim() && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    onClick={handleSend}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-1"
                    style={{
                      background: "linear-gradient(135deg, #7c6aff, #5b4adf)",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </motion.button>
                )}
                ""
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudioAIInput;
