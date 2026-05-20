import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const AICopilot = () => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const voiceCatcherRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const voiceCatcher =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!voiceCatcher) return;

    const catcher = new voiceCatcher();
    catcher.lang = "ko-KR";
    catcher.continuous = true;
    catcher.interimResults = true;

    catcher.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join("");
      setInputText(transcript);
    };
    voiceCatcherRef.current = catcher;
  }, []);

  const toggleListening = () => {
    if (isListening) voiceCatcherRef.current?.stop();
    else voiceCatcherRef.current?.start();
    setIsListening((prev) => !prev);
  };

  return (
    <div>
      <AnimatePresence>
        <motion.div className="w-10 h-4 border border-gray-400 ">
          <input
            type="text"
            placeholder="필요하신게 있으면 말씀해주세요!"
            autoFocus
            className="w-full h-full "
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AICopilot;
