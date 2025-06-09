"use client";

import { chat_sanction_component_props } from "@/types/chat";
import { option_data, option_duration } from "@/utils/chat";
import axios from "axios";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

// 애니메이션을 위해 선택된 아이템의 정보와 위치를 함께 저장할 타입
interface SelectedItemState {
  item: (typeof option_data)[0];
  rect: DOMRect;
}

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
  // 애니메이션 관련 상태
  const [animatingItem, setAnimatingItem] = useState<SelectedItemState | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // UI 변경: 기간 선택을 위한 새로운 상태
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const handleSelectReason = (
    option: (typeof option_data)[0],
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (selected_warning_reason === option.reason) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setAnimatingItem({ item: option, rect });

    // 부모 컴포넌트 상태 업데이트
    set_selected_warning_reason(option.reason);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, reason: option.reason, duration: null }; // duration 초기화
    });
  };

  useEffect(() => {
    if (animatingItem) {
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [animatingItem]);

  // UI 변경: 기간 선택 핸들러
  const handleSelectDuration = (duration: string) => {
    setSelectedDuration(duration);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, duration: duration };
    });
  };

  const sendSanctionInfo = async () => {
    if (!selectedDuration) {
      alert("제재 기간을 선택해주세요.");
      return;
    }
    alert(
      `전송: ${selected_message_for_modal?.reason}, 기간: ${selectedDuration}`
    );
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SANCTION_USER_API_URL as string,
        selected_message_for_modal
      );
      console.log("채팅 정지 관련 post", response);
      set_is_modal_open(false);
    } catch (error) {
      console.error("제재 정보 전송 실패:", error);
    }
  };

  const resetSelection = () => {
    setAnimatingItem(null);
    set_selected_warning_reason(null);
    setSelectedDuration(null);
  };

  return (
    <div className="bg-gray-200 absolute top-3 w-4/5 h-auto p-4 rounded-lg shadow-lg">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 z-50"
        onClick={() => set_is_modal_open(false)}
      >
        {" "}
        X{" "}
      </button>

      <div
        className={clsx("transition-opacity duration-300", {
          "opacity-0 pointer-events-none": animatingItem,
        })}
      >
        <span className="inline-block w-10 h-10 rounded-full border border-black align-middle">
          이미지
        </span>
        <span className="ml-2 align-middle">
          ID: {selected_message_for_modal?.user_nickname}
        </span>
        <div className="mt-2 p-2 bg-gray-100 rounded">
          {selected_message_for_modal?.message}
        </div>
      </div>

      {animatingItem ? (
        // --- 아이템 선택 후 애니메이션 & 상세 설정 UI ---
        <div
          // 초기 위치: 클릭된 요소의 위치 그대로
          style={{
            top: animatingItem.rect.top,
            left: animatingItem.rect.left,
            width: animatingItem.rect.width,
            height: animatingItem.rect.height,
          }}
          // 최종 위치: 모달 상단 중앙
          className={clsx(
            "fixed z-40 rounded-xl bg-white text-black shadow-2xl",
            "transition-all duration-500 ease-in-out", // 애니메이션 효과
            {
              // ✨ 애니메이션 최종 상태: 모달 상단 중앙으로 이동
              "!top-16 left-1/2 -translate-x-1/2 !w-[90%] max-w-md p-4":
                isAnimating,
              "p-4": !isAnimating,
            }
          )}
        >
          {/* 애니메이션이 끝난 후 내부 컨텐츠 표시 */}
          <div
            className={clsx(
              "transition-opacity duration-300 w-full",
              isAnimating ? "opacity-100 delay-300" : "opacity-0"
            )}
          >
            <h3 className="text-center text-lg font-bold text-blue-600">
              {animatingItem.item.reason}
            </h3>

            {/* ✨ UI 변경: 기간 선택 체크박스 리스트 */}
            <div className="mt-4 space-y-2">
              <p className="font-semibold text-sm text-gray-600 mb-2">
                제재 기간 선택:
              </p>
              {option_duration.map((duration, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectDuration(duration)}
                  // ✨ 목록 애니메이션: isAnimating 상태와 index를 이용한 촤르륵 효과
                  className={clsx(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer border",
                    "transition-all duration-500", // 개별 아이템의 애니메이션 시간
                    {
                      "bg-blue-50 border-blue-500 text-blue-700":
                        selectedDuration === duration,
                      "bg-gray-50 border-gray-200 hover:bg-gray-100":
                        selectedDuration !== duration,
                      // isAnimating 상태에 따라 나타나고 사라짐
                      "opacity-100 translate-y-0": isAnimating,
                      "opacity-0 translate-y-4": !isAnimating,
                    }
                  )}
                  // ✨ transition-delay를 이용한 촤르륵(Stagger) 효과
                  style={{
                    transitionDelay: `${isAnimating ? 300 + index * 70 : 0}ms`,
                  }}
                >
                  <span className="font-medium">{duration}</span>
                  {selectedDuration === duration && (
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={sendSanctionInfo}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:bg-gray-400"
                disabled={!selectedDuration}
              >
                전송하기
              </button>
              <button
                onClick={resetSelection}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
              >
                다시 선택
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- 아이템 선택 전 원래 리스트 ---
        <div className="mt-4 space-y-2">
          {option_data.map((option) => (
            <div
              key={option.id}
              onClick={(e) => handleSelectReason(option, e)}
              className="p-4 rounded-lg bg-white cursor-pointer shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
            >
              {option.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatSanction;
