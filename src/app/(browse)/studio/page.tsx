"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StudioAIInput from "./_components/studio-AI-input";
import LiveStat, { MiniCardInfo } from "./live-stat/live-stat";
import useUserStore from "@/store/user";

const LiveSetting = dynamic(() => import("./live-setting/page"));

const EASE = [0.22, 1, 0.36, 1] as const;

const StudioPage = () => {
  const { user } = useUserStore();

  const [selectTab, setSelectTab] = useState<string>("");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [allCards, setAllCards] = useState<MiniCardInfo[]>([]);

  const handleCardSelect = (index: number | null, cards: MiniCardInfo[]) => {
    setSelectedCardIndex(index);
    setAllCards(cards);
  };

  const miniCards = selectedCardIndex !== null
    ? allCards.filter((c) => c.index !== selectedCardIndex)
    : [];

  const TabContents: Record<string, React.ReactNode> = {
    liveStat: (
      <LiveStat
        roomName={user?.userId}
        selectedCardIndex={selectedCardIndex}
        onCardSelect={handleCardSelect}
      />
    ),
    liveSetting: <LiveSetting />,
  };

  return (
    <div className="border border-red-500 grid grid-cols-10 h-1/2">
      <div className="col-span-2">
        {Object.keys(TabContents).map((key) => (
          <div key={key} onClick={() => setSelectTab(key)}>
            {key}
          </div>
        ))}
      </div>

      <div className="col-span-8 h-1/2">
        {TabContents[selectTab] || (
          <LiveStat
            roomName={user?.userId}
            selectedCardIndex={selectedCardIndex}
            onCardSelect={handleCardSelect}
          />
        )}
        <StudioAIInput />
      </div>

      {/* ===== 미니 카드 오버레이 (AI 입력창 위) ===== */}
      <AnimatePresence>
        {miniCards.length > 0 && (
          <motion.div
            className="fixed bottom-[84px] left-1/2 flex gap-2 z-40"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {miniCards.map((card, i) => (
              <motion.button
                key={card.index}
                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 26,
                  delay: i * 0.05,
                }}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCardSelect(card.index, allCards)}
                className="flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[88px]"
                style={{
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "0.5px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <span className="text-[9px] uppercase tracking-[0.12em] text-black/30 mb-0.5">
                  {card.title}
                </span>
                <span className="text-[15px] font-semibold text-black/80 tabular-nums leading-none">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-[9px] text-black/25 mt-0.5">{card.unit}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioPage;
