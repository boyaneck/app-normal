import { chat_input_components_props } from "@/types/chat";
import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";
import Picker from "emoji-picker-react";
import { AnimatedHeart } from "./animated_heart";
import PaymentPage from "../../_components/payment/payment";
import useChatInput from "@/hooks/useChatInput";
export const ChatInput = ({
  chatInput,
  sendMessage,
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
  const { input, debounced, sendMsg, inputChange } = useChatInput();
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      // 한글 조합 중 엔터 방지
      e.preventDefault(); // form 태그 안에 있다면 submit 방지
      //   handleSendMessage();
    }
  };

  const message_input_ref = useRef<HTMLInputElement>(null);
  const chkInputDisabeld = useCallback(() => {
    const input_element = message_input_ref.current;
    if (!input_element) return;

    const msg_trim = input_element.value.trim();
    if (msg_trim.length === 0) {
      alert("메세지를 입력해주세요!");
      input_element.focus();
      return;
    }
  }, []);
  return (
    <span className="flex flex-row mt-3 ml-2 h-3/5">
      <input
        placeholder="메세지를 입력해주세요"
        ref={message_input_ref}
        value={message}
        onChange={chatInput}
        className=" bg-transparent border border-purple-400 w-2/3 h-full rounded-full"
      ></input>
      <button
        onClick={sendMessage}
        className={`hover:cursor-pointer
   `}
      >
        <Send className="w-5 h-5" />
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
      <span className="flex justify-center items-center ">
        <PaymentPage
          current_host_nickname={current_host_nickname}
          current_host_id={current_host_id}
        />
      </span>
    </span>
  );
};
