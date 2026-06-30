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
    <div className="w-full">

      {/* 서류파일철 탭 — 좌상단 돌출 */}
      <div className="w-16 h-6 bg-sky-100 border border-b-0 border-sky-600 rounded-tl-lg rounded-tr-lg flex items-center px-2">
        <span className="text-[9px] font-bold text-sky-600 tracking-widest uppercase">AI</span>
      </div>

      {/* 폴더 바디 */}
      <div className="border border-sky-600 rounded-b-2xl rounded-tr-2xl bg-sky-50 shadow-[0_4px_12px_rgba(2,132,199,0.4)] -mt-px p-4 pb-3">

        {/* 답변 텍스트 영역 — 흰 배경 */}
        <div className="bg-white rounded-lg overflow-hidden">
          <motion.div
            className="overflow-hidden"
            initial={{ height: COLLAPSED_H }}
            animate={{ height: targetHeight }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <p
              ref={contentRef}
              className="text-sm font-medium text-gray-800 leading-loose whitespace-pre-line p-3"
            >
              {answer}
            </p>
          </motion.div>
        </div>

        {/* 화살표 버튼 */}
        {isOverflowing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="mt-2 mx-auto flex items-center justify-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-medium text-sky-600 bg-sky-100 border border-sky-300 hover:bg-sky-200 transition-colors duration-200"
          >
            {isExpanded ? (
              <><ChevronUp size={10} strokeWidth={2.5} /><span>접기</span></>
            ) : (
              <><ChevronDown size={10} strokeWidth={2.5} /><span>더 보기</span></>
            )}
          </button>
        )}

      </div>
    </div>
  );
};

export default AIAnswer;
