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

const CARD_COLORS = ["#38bdf8", "#a78bfa", "#2dd4bf", "#e9a800", "#fb7185"];

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

const StudioPage = () => {
  const { user } = useUserStore();

  const [selectTab, setSelectTab] = useState<string>("");
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [allCards, setAllCards] = useState<MiniCardInfo[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [hoveredMiniCard, setHoveredMiniCard] = useState<number | null>(null);

  const handleCardSelect = (index: number | null, cards: MiniCardInfo[]) => {
    setSelectedCardIndex(index);
    setAllCards(cards);
    if (index !== null) {
      setMessages([{ id: "init", role: "ai", content: "궁금한 거 물어보세요" }]);
    } else {
      setMessages([]);
    }
  };

  const onChatAISendMsg = async (text: string) => {
    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    try {
      const selectedCard =
        selectedCardIndex !== null ? allCards.find((c) => c.index === selectedCardIndex) : null;

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
        { id: `a_${Date.now()}`, role: "ai", content: data.answer ?? "응답을 받지 못했습니다." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `a_${Date.now()}`, role: "ai", content: "AI 연결에 실패했습니다. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const miniCards =
    selectedCardIndex !== null ? allCards.filter((c) => c.index !== selectedCardIndex) : [];

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

  const activeTab = selectTab || "liveStat";

  return (
    <div className="flex h-full">
      {/* ===== 스튜디오 탭 사이드바 ===== */}
      <div
        className={`w-[100px] ml-[60px] shrink-0 flex flex-col items-center ${
          selectedCardIndex !== null ? "pt-6" : "pt-20"
        }`}
      >
        {/* 뒤로가기 버튼 or 고정 spacer */}
        {selectedCardIndex !== null ? (
          <button
            onClick={() => handleCardSelect(null, [])}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg text-black/60 bg-white/85 border border-white/90 shadow-md transition-all hover:scale-105"
          >
            ←
          </button>
        ) : (
          <div className="w-10 h-10 shrink-0" />
        )}

        {/* 탭 아이콘들 */}
        <div className="flex flex-col items-center gap-5 mt-[150px]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setSelectTab(tab.key)}
                className="group relative flex items-center"
              >
                {/* 아이콘 원형 버튼 */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-white/90 border border-white/95 shadow-md"
                      : "bg-white/10 border border-white/30"
                  }`}
                >
                  <span className={isActive ? "hidden" : "block group-hover:hidden"}>
                    {tab.iconOutline}
                  </span>
                  <span className={isActive ? "block" : "hidden group-hover:block"}>
                    {tab.iconSharp}
                  </span>
                </div>

                {/* 툴팁 */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium text-white bg-black/80 backdrop-blur shadow-lg">
                    {tab.label}
                  </div>
                  {/* 화살표 — CSS 삼각형, Tailwind 불가 */}
                  <div
                    className="absolute right-full top-1/2 -translate-y-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderRight: "5px solid rgba(0,0,0,0.8)",
                    }}
                  />
                </div>
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
        {miniCards.length > 0 && activeTab === "liveStat" && (
          <motion.div
            className="fixed bottom-[84px] left-[calc(50%+92px)] flex gap-2 z-40"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            {miniCards.map((card, i) => {
              const color = CARD_COLORS[card.index % CARD_COLORS.length];
              const isHovered = hoveredMiniCard === card.index;
              return (
                <motion.button
                  key={card.index}
                  initial={{ opacity: 0, y: 12, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26, delay: i * 0.05 }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCardSelect(card.index, allCards)}
                  onMouseEnter={() => setHoveredMiniCard(card.index)}
                  onMouseLeave={() => setHoveredMiniCard(null)}
                  className="flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[88px] bg-white/80 backdrop-blur-xl transition-all duration-200"
                  style={{
                    border: isHovered ? `1px solid ${color}99` : "0.5px solid rgba(0,0,0,0.08)",
                    boxShadow: isHovered
                      ? `0 4px 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.9)`
                      : "0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <span
                    className={`text-[9px] uppercase tracking-[0.12em] mb-0.5 transition-colors duration-200 ${
                      isHovered ? "" : "text-black/30"
                    }`}
                    style={isHovered ? { color } : undefined}
                  >
                    {card.title}
                  </span>
                  <span className="text-[15px] font-semibold text-black/80 tabular-nums leading-none">
                    {card.value.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-black/25 mt-0.5">{card.unit}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudioPage;
