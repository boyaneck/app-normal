import { chat_input_components_props } from "@/types/chat";
import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";
import Picker from "emoji-picker-react";
import { AnimatedHeart } from "./animated_heart";
import PaymentPage from "../../_components/payment/payment";
import useChatInput from "@/hooks/useChatInput";
export const ChatInput = ({
  set_show_emoji_picker,
  show_emoji_picker,
  emojiClick,
  heartClick,
  set_hearts,
  hearts,
  heartAnimationEnd,
  current_host_nickname,
  message,
  current_host_id,
  set_message,
}: chat_input_components_props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { input_msg, debounced, sendMsg, inputChange, blankChk, limit_text } =
    useChatInput({ current_host_id, inputRef });

  return (
    <div className="relative h-9 rounded-full ml-1">
      <input
        placeholder="메세지를 입력하세요"
        ref={inputRef}
        value={input_msg}
        onChange={inputChange}
        onKeyDown={(e) => {
          console.log("키보드 눌렸을때", e.code);
          if (e.code === "Enter" && blankChk) sendMsg();
        }}
        className="w-full h-full 
        transition-all duration-300
        rounded-full pl-2

        shadow-inner
        focus:outline-none
        focus-within:ring-2
        focus-within:ring-gray-400
        focus:bg-transparent
        bg-gray-100"
      ></input>
      <button
        disabled={!blankChk}
        onClick={sendMsg}
        className={`hover:cursor-pointer
        ${blankChk ? "bg-blue-600 " : ""}
          `}
      >
        <Send
          className={`absolute right-2 top-2 hover:bg-purple-400
          
          w-5 h-5`}
        />
      </button>
      <button
        className={`absolute right-3 -top-7 bg-gray-400 rounded-3xl shadow-lg transition-all duration-300
          ${limit_text < 20 ? "bg-red-300 text-white font-semibold " : ""}
          `}
      >
        d
      </button>
      {/* <button
        className="relative"
        onClick={() => set_show_emoji_picker(!show_emoji_picker)}
      >
        🙂
        {show_emoji_picker && (
          <div className="absolute bottom-full left-0 z-10 transform scale-75 translate-x-[-30%] translate-y-[12.5%]">
            <Picker onEmojiClick={emojiClick} />

          </div>
        )}
      </button> */}
      {/* <button className="relative" onClick={heartClick}>
        {hearts.map((heart) => (
          <AnimatedHeart
            key={heart?.id}
            id={heart?.id}
            onAnimationEnd={heartAnimationEnd}
            // className="absolute bottom-full left-0"
          />
        ))}
        ❤️
      </button> */}
      {/* <span className="flex justify-center items-center ">
        <PaymentPage
          current_host_nickname={current_host_nickname}
          current_host_id={current_host_id}
        />
      </span> */}
    </div>
  );
};
