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
    // debounced,
    sendMsg,
    inputChange,
    blankChk,
    limit_text,
    // inputRef,
    // scrollFixRef,
    wrapperRef,
    textareaRef,
    mouseLeave,
    // chkTextLength,
    is_overflow,
    is_hover,
    mouseEnter,
    // set_is_overflow,
  } = useChatInput({ current_host_id });

  return (
    <div>
      <div className=" absolute bottom-2 left-0 w-3/4 ">
        {/* <script>{scroll_fading}</script> */}
        <div
          className={`relative ml-1 h-9
        transition-[height] duration-500 ease-in-out
        ${is_overflow && is_hover ? `  top-fade-mask-active` : ""}`}
          ref={wrapperRef}
          style={{
            height: `${FIXED_HEIGHT_PX}px`,
          }}
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
      box-border
      pl-3 pr-10
      
      /* [세로 중앙 정렬 핵심] */
      /* py를 줄이고 leading을 조절하여 글자를 수직 중앙으로 배치 */
      py-[6px] 
      text-sm 
      leading-[24px] 
      
      resize-none
      shadow-inner
      focus:outline-none
      [scrollbar-width:none]
      block
    
            "
          />
        </div>
      </div>
    </div>
  );
};
