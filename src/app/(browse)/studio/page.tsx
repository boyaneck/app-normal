"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudioAIInput } from "./_components/AI-input";
import LiveStat, { MiniCardInfo } from "./live-stat/live-stat";
import useUserStore from "@/store/user";
import { ChatMessage } from "@/types/live";

const LiveSetting = dynamic(() => import("./live-setting/page"));

const EASE = [0.22, 1, 0.36, 1] as const;

const StudioPage = () => {
  const { user } = useUserStore();

  const [selectTab, setSelectTab] = useState<string>("");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  );
  const [allCards, setAllCards] = useState<MiniCardInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleCardSelect = (index: number | null, cards: MiniCardInfo[]) => {
    setSelectedCardIndex(index);
    setAllCards(cards);
    if (index !== null) {
      setMessages([
        { id: "init", role: "ai", content: "궁금한 거 물어보세요" },
      ]);
    } else {
      setMessages([]);
    }
  };

  const onChatAISendMsg = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    try {
      const selectedCard =
        selectedCardIndex !== null
          ? allCards.find((c) => c.index === selectedCardIndex)
          : null;

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardTitle: selectedCard?.title ?? "",
          currentValue: selectedCard?.value ?? 0,
          prevValue: selectedCard?.prevValue ?? null,
          unit: selectedCard?.unit ?? "",
          messages: updatedMessages.slice(-6),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "ai",
          content: data.answer ?? "응답을 받지 못했습니다.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "ai",
          content: "AI 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const miniCards =
    selectedCardIndex !== null
      ? allCards.filter((c) => c.index !== selectedCardIndex)
      : [];

  const renderLiveStat = () => (
    <LiveStat
      roomName={user?.userId}
      selectedCardIndex={selectedCardIndex}
      onCardSelect={handleCardSelect}
      messages={messages}
      onChatAISendMsg={onChatAISendMsg}
      isAiTyping={isAiTyping}
    />
  );

  const TabContents: Record<string, React.ReactNode> = {
    liveStat: renderLiveStat(),
    liveSetting: <LiveSetting />,
  };

  const TABS = [
    {
      key: "liveStat",
      label: "통계",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      key: "liveSetting",
      label: "설정",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const activeTab = selectTab || "liveStat";

  return (
    <div className="flex h-full">
      {/* ===== 스튜디오 탭 사이드바 ===== */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{ width: 100, paddingTop: 80, marginLeft: 60 }}
      >
        {/* 아이콘 묶음 — 타원형 컨테이너 */}
        <div
          className="flex flex-col items-center gap-5 px-3 py-6"
          style={{
            borderRadius: 60,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setSelectTab(tab.key)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive ? "rgba(124,106,255,0.3)" : "rgba(255,255,255,0.12)",
                    border: isActive ? "1.5px solid rgba(124,106,255,0.7)" : "1.5px solid rgba(255,255,255,0.4)",
                    boxShadow: isActive ? "0 0 20px rgba(124,106,255,0.35)" : "none",
                    color: isActive ? "#a78bfa" : "#ffffff",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.icon}
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: isActive ? "#a78bfa" : "rgba(255,255,255,0.7)",
                  letterSpacing: "0.04em",
                }}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto pb-[160px]">
        {TabContents[activeTab] || renderLiveStat()}
        {selectedCardIndex === null && activeTab === "liveStat" && (
          <StudioAIInput onSend={onChatAISendMsg} />
        )}
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
                  boxShadow:
                    "0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
              >
                <span className="text-[9px] uppercase tracking-[0.12em] text-black/30 mb-0.5">
                  {card.title}
                </span>
                <span className="text-[15px] font-semibold text-black/80 tabular-nums leading-none">
                  {card.value.toLocaleString()}
                </span>
                <span className="text-[9px] text-black/25 mt-0.5">
                  {card.unit}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioPage;
