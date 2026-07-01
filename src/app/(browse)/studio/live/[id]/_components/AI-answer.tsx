"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  answer?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
};

const COLLAPSED_H = 96;

const AIAnswer = ({ answer, isExpanded, onToggleExpand }: Props) => {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current || !answer) return;
    setContentHeight(contentRef.current.scrollHeight);
  }, [answer]);

  const isOverflowing = contentHeight > COLLAPSED_H;
  const targetHeight =
    contentHeight === 0
      ? COLLAPSED_H
      : isExpanded
        ? contentHeight
        : Math.min(COLLAPSED_H, contentHeight);

  return (
    <div
      className="w-full rounded-2xl bg-white border border-sky-300"
      style={{
        boxShadow:
          "0 2px 20px rgba(14, 165, 233, 0.10), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="px-4 pt-4 pb-3">
        {/* 라벨 */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-lg flex items-center justify-center bg-white border border-sky-100 shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C11.5 6.5 9.5 9.5 2 12C9.5 14.5 11.5 17.5 12 22C12.5 17.5 14.5 14.5 22 12C14.5 9.5 12.5 6.5 12 2Z"
                fill="#38bdf8"
              />
              <circle cx="19.5" cy="4.5" r="2.2" fill="#0ea5e9" />
            </svg>
          </div>
        </div>

        {/* 텍스트 */}
        <motion.div
          className="overflow-hidden"
          initial={{ height: COLLAPSED_H }}
          animate={{ height: targetHeight }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <p
            ref={contentRef}
            className="text-sm text-gray-800 leading-relaxed whitespace-pre-line"
          >
            {answer}
          </p>
        </motion.div>

        {/* 더보기 버튼 */}
        {isOverflowing && (
          <>
            <div className="mt-3 border-t border-gray-100" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              className="mt-2 flex items-center gap-1 text-[11px] font-medium text-sky-500 hover:text-sky-600 transition-colors duration-150"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={11} strokeWidth={2.5} />
                  <span>접기</span>
                </>
              ) : (
                <>
                  <ChevronDown size={11} strokeWidth={2.5} />
                  <span>더 보기</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAnswer;
