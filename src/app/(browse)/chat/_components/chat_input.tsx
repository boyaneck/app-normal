import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";
import Picker from "emoji-picker-react";
import { AnimatedHeart } from "./animated_heart";
import PaymentPage from "../../_components/payment/payment";
import useChatInput from "@/hooks/useChatInput";
import { FIXED_HEIGHT_PX, scroll_fading } from "@/utils/chat";
import LoginRequiredModal from "../../_components/login-required-modal";

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
    is_login_modal_open,
    close_login_modal,
  } = useChatInput({ current_host_id });

  return (
    <div className="relative flex-1 h-full">
      <LoginRequiredModal is_open={is_login_modal_open} onClose={close_login_modal} />
      <div className=" absolute bottom-2 left-0 w-[calc(100%-0.5rem)] flex items-end gap-1 ">
        {/* <script>{scroll_fading}</script> */}
        <div
          className={`relative ml-1 h-9 flex-1 min-w-0
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
              // 한글 입력 중(조합 중)에 Enter를 누르면 조합 확정 이벤트와 실제 Enter가
              // 각각 keydown을 한 번씩 더 쏴서 sendMsg()가 두 번 불림 — 조합 중이면 무시
              if (e.code === "Enter" && !e.nativeEvent.isComposing && blankChk) {
                sendMsg();
              }
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
        <button
          onClick={() => { if (blankChk) sendMsg(); }}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-2xl transition-colors ${
            blankChk ? "bg-cyan-500 hover:bg-cyan-600" : "bg-transparent"
          }`}
        >
          <Send size={18} className={blankChk ? "text-white" : "text-gray-400"} />
        </button>
      </div>
    </div>
  );
};
