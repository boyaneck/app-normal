"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const StudioAIWelcome = () => {
  const [phase, setPhase] = useState("square");

  const welcomText = ` 님 안녕하세요!`;

  const [AiText, setAIText] = useState("");
  useEffect(() => {
    if (phase !== "typing") return;

    let index = 0;
    const interval = setInterval(() => {
      index++;
      setAIText(welcomText.slice(0, index));
      if (index >= welcomText.length) {
        clearInterval(interval);
        setTimeout(() => {
          (setPhase("shrink"), 1500);
        });
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    // 1. 0.6초 뒤에 확장
    const t1 = setTimeout(() => setPhase("expand"), 600);
    // 2. 1.1초 뒤에 타이핑 시작
    const t2 = setTimeout(() => setPhase("typing"), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // moveTop 단계에서 onComplete 실행
  useEffect(() => {
    if (phase !== "moveTop") return;
    const t = setTimeout(() => {
      setPhase("done");
      // onComplete?.();
    }, 800);
    return () => clearTimeout(t);
  }, [phase]);
  const boxAnimate = () => {
    switch (phase) {
      case "square": // 초기 사각형
        return {
          width: 48,
          height: 48,
          borderRadius: 12,
          top: "50%",
          y: "-50%",
        };
      case "expand": // 옆으로 길어짐
      case "typing":
        return {
          width: 420,
          height: 56,
          borderRadius: 28,
          top: "50%",
          y: "-50%",
        };
      case "shrink": // 다시 작아짐
        return {
          width: 48,
          height: 48,
          borderRadius: 12,
          top: "50%",
          y: "-50%",
        };
      case "moveTop": // 상단으로 이동
        return { width: 200, height: 44, borderRadius: 22, top: 24, y: "0%" };
      default:
        return { width: 200, height: 44, borderRadius: 22, top: 24, y: "0%" };
    }
  };
  const boxStyle = boxAnimate();
  const showText = phase === "typing" || phase === "expand";

  const iconState =
    phase === "square" || phase === "shrink" || phase === "moveTop`";
  return (
    <div>
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div className="fixed inset-0 z-50 flex justify-center">
            <motion.div
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
              animate={{
                opacity: phase === "shrink" || phase === "moveTop" ? 0 : 1,
              }}
            >
              <motion.div
                animate={{
                  left: iconState ? "50%" : 16,
                  x: iconState ? "-50%" : 0,
                }}
              >
                //아이콘 위치
              </motion.div>
              {showText && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {AiText}
                </motion.span>
              )}
              <motion.span></motion.span>
              <motion.div className="absolute lfet-1/2 bg-white/85 shadow-lg"></motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioAIWelcome;
