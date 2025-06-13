"use client";

import { chat_sanction_component_props } from "@/types/chat";
import { option_data, sanction_duration } from "@/utils/chat";
import axios from "axios";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

// 애니메이션을 위해 선택된 아이템의 정보와 위치를 함께 저장할 타입
interface selected_item_state {
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
  const [animating_item, set_animating_item] =
    useState<selected_item_state | null>(null);
  const [is_animating, set_is_animating] = useState(false);

  // UI 변경: 기간 선택을 위한 새로운 상태
  const [selected_duration, set_selected_duration] = useState<string | null>(
    null
  );

  const selectReason = (
    option: (typeof option_data)[0],
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (selected_warning_reason === option.reason) return;

    const rect = e.currentTarget.getBoundingClientRect();
    set_animating_item({ item: option, rect });

    // 부모 컴포넌트 상태 업데이트
    set_selected_warning_reason(option.reason);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, reason: option.reason, duration: null }; // duration 초기화
    });
  };

  useEffect(() => {
    if (animating_item) {
      const timer = setTimeout(() => set_is_animating(true), 10);
      return () => clearTimeout(timer);
    } else {
      set_is_animating(false);
    }
  }, [animating_item]);

  // UI 변경: 기간 선택 핸들러
  const selectDuration = (duration: string) => {
    set_selected_duration(duration);
    set_selected_message_for_modal((prev) => {
      if (prev === null) return null;
      return { ...prev, duration: duration };
    });
  };

  const sendSanctionInfo = async () => {
    if (!selected_duration) {
      alert("제재 기간을 선택해주세요.");
      return;
    }
    alert(
      `전송: ${selected_message_for_modal?.reason}, 기간: ${selected_duration}`
    );
    console.log("메세지 정보", selected_message_for_modal);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SANCTION_USER_API_URL as string,
        selected_message_for_modal
      );
      console.log("어ㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓㅓ");
      console.log("채팅 정지 관련 post", response);
      set_is_modal_open(false);
    } catch (error) {
      console.error("제재 정보 전송 실패:", error);
    }
  };

  const resetSelection = () => {
    set_animating_item(null);
    set_selected_warning_reason(null);
    set_selected_duration(null);
  };

  return (
    <div className="bg-gray-300 absolute top-3 w-4/5 h-auto p-4 rounded-lg shadow-lg">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 z-50"
        onClick={() => set_is_modal_open(false)}
      >
        X
      </button>

      <div
        className={clsx("transition-opacity duration-300", {
          "opacity-0 pointer-events-none": animating_item,
        })}
      >
        <span className="inline-block w-10 h-10 rounded-full border border-black align-middle">
          이미지
        </span>
        <span className="ml-2 align-middle">
          ID: {selected_message_for_modal?.user_nickname}zxczxczczcxcz
        </span>
        <div className="mt-2 p-2 bg-gray-100 rounded">
          {selected_message_for_modal?.message}
        </div>
      </div>

      {animating_item ? (
        // --- 아이템 선택 후 애니메이션 & 상세 설정 UI ---
        <div
          // 초기 위치: 클릭된 요소의 위치 그대로
          // style={{
          //   top: animating_item.rect.top,
          //   left: animating_item.rect.left,
          //   width: animating_item.rect.width,
          //   height: animating_item.rect.height,
          // }}
          className={clsx(
            "fixed z-40 rounded-xl bg-gray-200 text-black shadow-2xl ",
            "transition-all duration-300 ease-in-out", // 애니메이션 효과
            {
              // ✨ 애니메이션 최종 상태: 모달 상단 중앙으로 이동
              "!top-32 left-4/5   p-4": is_animating,
              "p-4": !is_animating,
            }
          )}
        >
          {/* --제재 사항 DIV-- */}
          <div
            className={clsx(
              "transition-opacity duration-100 w-full bg-white",
              is_animating ? "opacity-100 delay-100" : "opacity-0"
            )}
          >
            <div className="border border-black bg-gray-400 p-3 rounded-lg">
              <h2 className="text-center text-sm font-bold text-black">
                {animating_item.item.reason}
              </h2>
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-semibold text-sm text-gray-600 mb-2">
                제재 기간 선택:
              </p>
              {sanction_duration.map((duration, index) => (
                <div
                  key={index}
                  onClick={() => selectDuration(duration)}
                  className={clsx(
                    "flex items-center text-[9px] justify-between p-2 rounded-lg cursor-pointer border ml-3 w-3/5",
                    "transition-all duration-500", // 개별 아이템의 애니메이션 시간
                    {
                      " border-gray-300 text-red-700":
                        selected_duration === duration,
                      "bg-gray-50 border-red-200 hover:bg-red-100":
                        selected_duration !== duration,
                      // is_animating 상태에 따라 나타나고 사라짐
                      "opacity-100 translate-y-0": is_animating,
                      "opacity-0 translate-y-4": !is_animating,
                    }
                  )}
                  style={{
                    transitionDelay: `${is_animating ? 300 + index * 70 : 0}ms`,
                  }}
                >
                  <span className="font-medium">{duration}</span>
                  {selected_duration === duration && (
                    <CheckIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={sendSanctionInfo}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold disabled:bg-gray-400"
                disabled={!selected_duration}
              >
                전송
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
              onClick={(e) => selectReason(option, e)}
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
