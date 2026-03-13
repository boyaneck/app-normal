"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const StudioAIWelcome = (userName = "호스트") => {
  const [phase, setPhase] = useState("square");

  const welcomText = `${userName} 님 안녕하세요!`;

  useEffect(() => {}, []);

  return (
    <div>
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div className="fixed inset-0 z-50 flex justify-center">
            <motion.div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioAIWelcome;
