import { animated_component_props, remove_message_props } from "@/types/chat";
import { useState } from "react";

export const AnimatedMessage = ({
  message,
  is_visible,
  avatar_url,
  user_id,
  user_nickname,
  user_email,
  selected_message_for_modal,
  set_selected_message_for_modal,
  is_modal_open,
  set_is_modal_open,
}: animated_component_props) => {
  console.log("메시지 확인하기", message);
  return (
    <span
      className=""
      onClick={() => {
        set_selected_message_for_modal({
          message,
          is_visible,
          avatar_url,
          user_id,
          user_nickname,
          user_email,
        });
        set_is_modal_open(true);
      }}
    >
      <div
        className={`
    cursor-pointer
    flex items-start 
    transition-all duration-200 ease-in-out
    ml-1 rounded-sm
    pt-1 text-sm
    pb-1
    ${is_visible ? "animate-fade-out-up" : ""}
  `}
      >
        {/* 1. 아바타 컨테이너: 크기 고정 (Shrink 방지) */}
        <span className="flex-shrink-0">
          <img
            className="w-6 h-6 object-cover bg-gray-400 rounded-full"
            src={avatar_url}
            alt="유저 아바타"
          />
        </span>

        <div className="flex-grow ml-1 pr-2 min-w-0">
          <span className="  break-all whitespace-normal">{message}</span>
        </div>
      </div>
    </span>
  );
};
