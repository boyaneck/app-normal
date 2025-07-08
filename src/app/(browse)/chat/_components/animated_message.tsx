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
        className="group cursor-pointer hover:font-bold hover:shadow-xl hover:scale-[1.02]
        transition-all duration-200 ease-in-out rounded-sm 
        "
      >
        <span>
          <img
            className="w-6 h-6 object-cover bg-gray-400 rounded-full inline-block "
            src={avatar_url}
            alt=""
          />
          <span className="pl-1 pb-1 pt-2  bottom-0.5 text-xs text-white">
            아이디
          </span>
        </span>
        <div
          className={
            is_visible
              ? "animate-fadeOutUp pt-1 text-sm text-gray-500"
              : "pt-1 text-sm text-gray-500"
          }
        >
          {message}
        </div>
      </div>
    </span>
  );
};
