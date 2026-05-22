"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import AIAnswer from "./AI-answer";

const AICopilot = () => {
  //1.기존의 recordType 이랑 ReturnType이랑 먼차이임 ?
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const voiceCatcherRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSilenceTimer = () => {
    //현재 작동중인 타이머 chk! -> 있다면 해당 타이머 종료
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  const startSilenceTiemr = (ms: number) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      voiceCatcherRef.current?.stop();
      //setIsListening 이 부분은 조건절로 들어가야함, 작동하는게 아닌 대기중이기에 true로 되어있지 않아야하나 ..
      // setIsListening(false);
      //Ref에 settimeout을 넣어둔다는게, 이게 ref가 정확히 뭐였지 근데?
    }, ms);
  };
  useEffect(() => {
    const VoiceCatcher =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!VoiceCatcher) return;
    const catcher = new VoiceCatcher();
    catcher.lang = "ko-KR";
    catcher.continuous = true; // 말 끝나면 자동 종료
    catcher.interimResults = false; // 텍스트 실시간 표시 안 함
    catcher.onresult = (e) => {
      const result = e.results[e.results.length - 1][0].transcript;
      setTranscript(result);
      startSilenceTiemr(2000);
    };

    catcher.onstart = () => {
      //음성인식 버튼 작동 후 2초가 넘어가면 기능 종료
      startSilenceTiemr(2000);
    };
    // 말이 끝나면 자동으로 멈춤
    catcher.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
    };
    voiceCatcherRef.current = catcher;
  }, []);
  const toggleListening = () => {
    if (isListening) {
      voiceCatcherRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      voiceCatcherRef.current?.start();
      setIsListening(true);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      {/* 마이크 버튼 */}
      <div className="relative flex items-center justify-center">
        {/* 떨리는 외곽 링 — 인식 중일 때만 */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-sky-400/50"
                  initial={{ width: 80, height: 80, opacity: 0.7 }}
                  animate={{ width: 160, height: 160, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        {/* 메인 버튼 */}
        <motion.button
          onClick={toggleListening}
          animate={
            isListening ? { scale: [1, 1.06, 0.97, 1.04, 1] } : { scale: 1 }
          }
          transition={
            isListening
              ? { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-colors duration-300 ${
            isListening
              ? "bg-sky-500 shadow-sky-400/40"
              : "bg-white/10 border border-white/20"
          }`}
        >
          {isListening ? (
            <Mic size={32} className="text-white" />
          ) : (
            <MicOff size={32} className="text-white/60" />
          )}
        </motion.button>
      </div>
      {/* 상태 텍스트 */}
      <p className="text-sm text-white/40 tracking-widest">
        {isListening ? "듣고 있어요..." : "마이크를 눌러 말해보세요"}
      </p>
      "unstaged 된 코드 커밋하기 확인 메세지(2)"
      <AIAnswer />
    </div>
  );
};

export default AICopilot;
