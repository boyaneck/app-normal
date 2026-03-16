"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const StudioAIWelcome = ({
  username = "호스트 님 안녕하세요 반갑습니다  ",
}) => {
  const [phase, setPhase] = useState("square");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("expand"), 600),
      setTimeout(() => setPhase("text"), 1100),
      setTimeout(() => setPhase("hideText"), 3000),
      setTimeout(() => setPhase("shrink"), 3400),
      setTimeout(() => setPhase("moveBottom"), 4200),
      setTimeout(() => setPhase("input"), 4800),
      // setTimeout(() => { setPhase("done"); onComplete?.(); }, 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const boxAnimate = {
    // square: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    // expand: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    // text: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    // shrink: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    // moveBottom: {
    //   width: 48,
    //   height: 48,
    //   borderRadius: 12,
    //   top: "calc(100vh - 72px)",
    //   y: "0%",
    // },
    // input: {
    //   width: 360,
    //   height: 48,
    //   borderRadius: 24,
    //   top: "calc(100vh - 72px)",
    //   y: "0%",
    // },
    square: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    expand: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    text: { width: 360, height: 52, borderRadius: 26, top: "50%", y: "-50%" },
    hideText: {
      width: 360,
      height: 52,
      borderRadius: 26,
      top: "50%",
      y: "-50%",
    },
    // shrink: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    shrink: { width: 48, height: 48, borderRadius: 12, top: "50%", y: "-50%" },
    moveBottom: {
      width: 48,
      height: 48,
      borderRadius: 12,
      top: "calc(100vh - 72px)",
      y: "0%",
    },
    input: {
      width: 360,
      height: 48,
      borderRadius: 24,
      top: "calc(100vh - 72px)",
      y: "0%",
    },
  };

  const current = boxAnimate[phase] || boxAnimate.moveBottom;
  const showText = phase === "text" || phase === "expand";
  const iconCenter =
    phase === "square" || phase === "shrink" || phase === "moveBottom";
  const isBottom = phase === "moveBottom" || phase === "input";

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed z-50 left-1/2 flex items-center overflow-hidden "
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
      initial={{
        width: 48,
        height: 48,
        borderRadius: 12,
        top: "50%",
        y: "-50%",
        opacity: 0,
      }}
      animate={{ ...current, opacity: 1 }}
      transition={{
        width: { duration: 0.6, ease: EASE },
        height: { duration: 0.5, ease: EASE },
        borderRadius: { duration: 0.5 },
        top: { duration: 0.7, ease: EASE },
        y: { duration: 0.7, ease: EASE },
        opacity: { duration: 0.25 },
        scale: { type: "spring", stiffness: 260, damping: 22 },
      }}
    >
      <motion.div
        className="absolute flex items-center justify-center"
        animate={{
          left: iconCenter ? "calc(50%-14)" : 14,
          // x: iconCenter ? "-50%" : 0,
        }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #7c6aff, #5b4adf)" }}
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
            {`${username}님 안녕하세요`.split("").map((text, i) => (
              <div
                key={i}
                style={{ overflow: "hidden", height: 20, width: "auto" }}
              >
                <motion.span
                  className="text-sm font-medium"
                  style={{ color: "#1a1a2e", display: "block" }}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    y: {
                      duration: 0.25,
                      delay: i * 0.03,
                      ease: EASE,
                    },
                    opacity: { duration: 0.01, delay: i * 0.03 },
                  }}
                >
                  {text === " " ? "\u00A0" : text}
                </motion.span>
              </div>
            ))}
          </motion.div>
        )}
        {phase === "input" && (
          <motion.div
            style={{ marginLeft: 50, flex: 1, marginRight: 14 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <input
              type="text"
              placeholder="AI에게 무엇이든 물어보세요..."
              autoFocus
              className="text-sm w-full outline-none bg-transparent"
              style={{ color: "#1a1a2e" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudioAIWelcome;
