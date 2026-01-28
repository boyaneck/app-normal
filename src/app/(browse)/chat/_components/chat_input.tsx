import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";
import Picker from "emoji-picker-react";
import { AnimatedHeart } from "./animated_heart";
import PaymentPage from "../../_components/payment/payment";
import useChatInput from "@/hooks/useChatInput";
import { FIXED_HEIGHT_PX, scroll_fading } from "@/utils/chat";

interface props {
  current_host_id: string;
}
export const ChatInput = ({ current_host_id }: props) => {
  const {
    input_msg,
    debounced,
    sendMsg,
    inputChange,
    blankChk,
    limit_text,
    inputRef,
    scrollFixRef,
    wrapperRef,
    textareaRef,
    mouseLeave,
    chkTextLength,
    is_overflow,
    is_hover,
    mouseEnter,
    set_is_overflow,
  } = useChatInput({ current_host_id });

  return (
    <div>
      <div className=" absolute bottom-0 left-0 w-3/4 ">
        {/* <script>{scroll_fading}</script> */}
        <div
          className={`relative ml-1 h-9
        transition-all duration-500 ease-in-out
        ${is_overflow && is_hover ? `  top-fade-mask-active` : ""}`}
          ref={wrapperRef}
          style={{ height: `${FIXED_HEIGHT_PX}px` }}
        >
          <textarea
            placeholder="메세지를 입력하세요"
            ref={textareaRef}
            value={input_msg}
            onChange={inputChange}
            onMouseEnter={mouseEnter}
            onMouseLeave={mouseLeave}
            onKeyDown={(e) => {
              if (e.code === "Enter" && blankChk) sendMsg();
            }}
            className="
           rounded-xl
          w-full h-full 
        transition-all duration-300
        pl-2 pr-5 py-[6px] text-sm leading-tight
        resize-none
        shadow-inner
        focus:outline-none
        focus-within:ring-gray-400
        focus:bg-transparent
        [scrollbar-width:none]
        [-ms-overflow-style:none] 
    [&::-webkit-scrollbar]:display-none
        bg-gray-100"
          />
          <button
            disabled={!blankChk}
            onClick={sendMsg}
            className={`hover:cursor-pointer
        ${blankChk ? "bg-blue-600 " : ""}
          `}
          >
            <Send
              className={`absolute right-2 top-2 w-5 h-5
              transition-all duration-300 ease-in-out
              ${is_overflow && is_hover ? "opacity-0" : ""}
          `}
            />
          </button>
          <button
            className={`absolute right-3 -top-7 bg-gray-400 rounded-3xl shadow-lg transition-all duration-300
          ${limit_text < 20 ? "bg-red-300 text-white font-semibold " : ""}
          `}
          ></button>
        </div>
      </div>
    </div>
  );
};
