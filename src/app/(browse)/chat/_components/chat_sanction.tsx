"use client";

import { chat_sanction_component_props } from "@/types/chat";
import { option_data, sanction_duration } from "@/utils/chat";
import axios from "axios";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

// 체크 아이콘 SVG 컴포넌트
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z"
      clipRule="evenodd"
    />
  </svg>
);

const ChatSanction = ({
  set_is_modal_open,
  selected_message_for_modal,
  set_selected_message_for_modal,
  selected_warning_reason,
  set_selected_warning_reason,
}: chat_sanction_component_props) => {
  // 상태 관리 단순화
  const [show_duration_list, set_show_duration_list] = useState(false);
  const [selected_duration, set_selected_duration] = useState<string | null>(
    null
  );
  const [show_reason_list, set_show_reason_list] = useState(false);

  // 컴포넌트 마운트 시 이유 목록 표시
  useEffect(() => {
    const timer = setTimeout(() => set_show_reason_list(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 이유 선택 핸들러
  const selectReason = (option: (typeof option_data)[0]) => {
    if (selected_warning_reason === option.reason) return;
    set_show_reason_list(false);
    set_selected_warning_reason(option.reason);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, reason: option.reason, duration: null };
    });
    setTimeout(() => {
      set_show_duration_list(true);
    }, 300);
  };

  // 기간 선택 핸들러
  const selectDuration = (duration: string) => {
    set_selected_duration(duration);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, duration: duration };
    });
  };

  // 제재 정보 전송
  const sendSanctionInfo = async () => {
    if (!selected_duration) return;
    try {
      // ... axios post 로직
      console.log("전송할 정보:", selected_message_for_modal);
      alert("제재 정보가 전송되었습니다.");
      set_is_modal_open(false);
    } catch (error) {
      console.error("제재 정보 전송 실패:", error);
    }
  };

  // 취소 및 이전 단계로 돌아가기
  const handleCancel = () => {
    set_show_duration_list(false);
    set_selected_warning_reason(null);
    set_selected_duration(null);
    setTimeout(() => {
      set_show_reason_list(true);
    }, 300);
  };

  return (
    // [레이아웃 유지] 기존 모달의 최상위 div 구조는 그대로 사용
    <div className="absolute inset-0 top-2 border rounded-xl border-black w-4/5 h-full left-1/2 -translate-x-1/2 bg-white overflow-hidden">
      {/* --- 상단 정보 및 닫기 버튼 --- */}
      <div className="flex justify-between mt-3 px-3">
        <div className="flex gap-2 items-center text-sm">
          <div className="w-4 h-4 rounded-full border border-black bg-gray-200" />
          <span>Id: {selected_message_for_modal?.user_nickname}</span>
        </div>
        <button
          className="text-xl font-bold"
          onClick={() => set_is_modal_open(false)}
        >
          ×
        </button>
      </div>
      <div className="px-3 mt-2 text-sm">
        {selected_message_for_modal?.message}
      </div>

      {/* --- 제재 이유 목록 --- */}
      <div className="mt-4 space-y-2 flex flex-col items-center">
        {option_data.map((option, index) => (
          <div
            key={option.id}
            onClick={() => selectReason(option)}
            className={clsx(
              `p-2 rounded-lg cursor-pointer w-[200px] shadow-sm text-xs text-center
               transition-all duration-300 transform hover:scale-105`,
              {
                "opacity-100 translate-y-0": show_reason_list,
                "opacity-0 translate-y-4": !show_reason_list,
                "pointer-events-none": show_duration_list,
                "bg-white hover:bg-gray-50": !show_duration_list,
              }
            )}
            style={{
              transitionDelay: `${show_reason_list ? index * 70 : 0}ms`,
            }}
          >
            {option.reason}
          </div>
        ))}
      </div>

      {/* --- [기능 융합] 제재 기간 선택 화면 --- */}
      {/* 이 부분이 이유 목록 위를 덮는 형태로 나타납니다. */}
      <div
        className={clsx(
          `absolute inset-0 top-0 bg-white transition-opacity duration-300 ease-in-out
           flex flex-col`, // flex-col로 내부 요소 수직 정렬
          {
            "opacity-100": show_duration_list,
            "opacity-0 pointer-events-none": !show_duration_list,
          }
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-center">제재 기간 선택</h2>
        </div>

        {/* 기간 선택 목록 (스크롤 가능한 영역) */}
        <div className="flex-grow p-4 space-y-2 flex flex-col items-center overflow-y-auto">
          {sanction_duration?.map((duration, idx) => (
            <div
              key={idx}
              onClick={() => selectDuration(duration)}
              className={clsx(
                `text-sm p-3 w-4/5 text-left rounded-lg cursor-pointer flex justify-between items-center
                 transform transition-all duration-500 ease-out 
                 hover:shadow-md`,
                {
                  "bg-sky-500 text-white font-bold border-sky-600":
                    selected_duration === duration,
                  "bg-gray-100 hover:bg-gray-200":
                    selected_duration !== duration,
                  "opacity-100 translate-y-0": show_duration_list,
                  "opacity-0 -translate-y-4": !show_duration_list,
                }
              )}
              style={{
                transitionDelay: `${show_duration_list ? 100 + idx * 70 : 0}ms`,
              }}
            >
              <span>{duration}</span>
              {selected_duration === duration && (
                <CheckIcon className="w-5 h-5" />
              )}
            </div>
          ))}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="w-full flex justify-end gap-x-3 p-4 border-t bg-white">
          <button
            onClick={handleCancel}
            className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={sendSanctionInfo}
            disabled={!selected_duration}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors
                       disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSanction;
