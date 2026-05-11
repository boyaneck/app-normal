"use client";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudioAIInput } from "./_components/AI-input";
import LiveStat, { MiniCardInfo } from "./live-stat/live-stat";
import useUserStore from "@/store/user";
import { ChatMessage } from "@/types/live";
import { IoStatsChartOutline } from "react-icons/io5";
import { IoStatsChartSharp } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { IoSettingsSharp } from "react-icons/io5";
import axios from "axios";
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

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/chat`,
        {
          cardTitle: selectedCard?.title ?? "",
          currentValue: selectedCard?.value ?? 0,
          prevValue: selectedCard?.prevValue ?? null,
          unit: selectedCard?.unit ?? "",
          messages: updatedMessages.slice(-6),
        },
      );

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
      iconOutline: <IoStatsChartOutline size={20} />,
      iconSharp: <IoStatsChartSharp size={20} />,
    },
    {
      key: "liveSetting",
      label: "설정",
      iconOutline: <IoSettingsOutline size={20} />,
      iconSharp: <IoSettingsSharp size={20} />,
    },
  ];

  const activeTab = selectTab || "liveStat";

  return (
    <div className="flex h-full">
      {/* ===== 스튜디오 탭 사이드바 ===== */}
      <div
        className="flex-shrink-0 flex flex-col items-center"
        style={{
          width: 100,
          paddingTop: selectedCardIndex !== null ? 24 : 80,
          marginLeft: 60,
        }}
      >
        {/* AI 채팅 모드: 뒤로가기 버튼 — 패널 상단과 동일 높이 */}
        {selectedCardIndex !== null && (
          <button
            onClick={() => handleCardSelect(null, [])}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1.5px solid rgba(255,255,255,0.9)",
              color: "rgba(0,0,0,0.6)",
              fontSize: 18,
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            ←
          </button>
        )}

        {/* 탭 아이콘들 — AI 모드: 뒤로가기 버튼으로부터 150px 아래 */}
        <div
          className="flex flex-col items-center gap-5"
          style={{ marginTop: selectedCardIndex !== null ? 150 : 0 }}
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
                  className="width:48 height:48 radius:"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isActive ? tab.iconSharp : tab.iconOutline}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: isActive ? "#a78bfa" : "rgba(255,255,255,0.75)",
                    letterSpacing: "0.04em",
                  }}
                >
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
            className="fixed bottom-[84px] flex gap-2 z-40"
            style={{ x: "-50%", left: "calc(50% + 92px)" }}
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
