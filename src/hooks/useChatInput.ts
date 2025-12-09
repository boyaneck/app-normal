import { useSocketStore } from "@/store/socket_store";
import useUserStore from "@/store/user";
import {
  FIXED_HEIGHT_PX,
  LIMIT_HEIGHT_PX,
  TRANSITION_DURATION_MS,
} from "@/utils/chat";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";

interface props {
  current_host_id: string;
}
const useChatInput = ({ current_host_id }: props) => {
  const [input_msg, set_input_msg] = useState<string>("");
  const [debounced, set_debounced] = useState<string>("");
  const [text_length_X, set_text_length_X] = useState<number>(0);
  const [text_overflow, set_text_overflow] = useState<boolean>(false);

  const { socket, connect_socket } = useSocketStore();
  useEffect(() => {
    if (!socket) {
      connect_socket();
    }

    return () => {
      socket?.off("receive_message");
    };
  }, [socket, connect_socket]);

  const user_info = useUserStore((state) => state.user);

  const inputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 250) set_input_msg(e.target.value);
  };

  const chkTextLength = useCallback(() => {
    const text_length = textareaRef?.current;
    if (!text_length) return;

    const original_height = text_length.style.height;
    text_length.style.height = "auto";
    const scroll_length = text_length.scrollHeight;
    text_length.style.height = original_height;

    set_text_length_X(scroll_length);

    const max_height_X = 4.5 * 16;
    set_text_overflow(scroll_length > max_height_X);
  }, []);

  const [is_hover, set_is_hover] = useState<boolean>(false);
  const [is_overflow, set_is_overflow] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollFixRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mouseLeave = useCallback(() => {
    const tx = textareaRef.current;
    if (!tx) return;

    set_is_hover(false);
    if (scrollFixRef.current) {
      console.log("스크롤핅스 이새끼", scrollFixRef.current);
      cancelAnimationFrame(scrollFixRef.current);
      console.log("스크롤 캔슬 애니메이션이후 상태 ", scrollFixRef.current);
      scrollFixRef.current = null;
    }
    const fixScroll = () => {
      if (tx) {
        tx.scrollTop = tx.scrollHeight;
      }

      scrollFixRef.current = requestAnimationFrame(fixScroll);
    };

    fixScroll();
    console.log("픽스스크롤 이후 ", scrollFixRef.current);
    setTimeout(() => {
      if (scrollFixRef.current) {
        cancelAnimationFrame(scrollFixRef.current);
        scrollFixRef.current = null;
      }
      if (tx) {
        tx.scrollTop = 0;
        tx.style.height = "100%";
      }
    }, TRANSITION_DURATION_MS);
  }, []);
  useEffect(() => {
    const tx = textareaRef.current;
    const wrap = wrapperRef.current;

    if (!tx || !wrap) return;

    //textarea 안의 타이핑 줄수의 높이를 해당 줄수에 맞추기 위해서
    tx.style.height = "auto";
    const curr_scroll_height = tx.scrollHeight;
    console.log("현재 스크롤의 높이 ", curr_scroll_height);

    const expand = is_hover && curr_scroll_height > LIMIT_HEIGHT_PX;
    const new_height = expand ? curr_scroll_height : FIXED_HEIGHT_PX;
    console.log(
      "육안상 차이는 없지만 현재 textarea의 스크롤의  최고 높이",
      new_height
    );
    set_is_overflow(curr_scroll_height > LIMIT_HEIGHT_PX);

    //만약 지정한 FIXED 높이보다 높으면, 해당 높이로 WRAP도 맞춤
    wrap.style.height = `${new_height}px`;

    tx.style.overflowY = expand ? "hidden" : "auto";
    tx.style.height = "100%";
  }, [is_hover, input_msg, textareaRef, wrapperRef]);
  const mouseEnter = () => {
    set_is_hover(true);
  };
  const sendMsg = () => {
    console.log("메ㅔㅅ지 확인하기", input_msg);
    const user_nickname = user_info?.user_nickname;
    const avatar_url = user_info?.avatar_url;
    const id = user_info?.user_id;
    const email = user_info?.user_email;
    const date = dayjs().toISOString();
    const current_chat_room_number = "5";
    console.log("현재 호스트의 아이디", current_host_id);
    const message_info = {
      current_host_id,
      user_nickname,
      avatar_url,
      message: input_msg,
      date,
      id,
      email,
      current_chat_room_number,
    };
    console.log("소켓으로 보내기전의 메세지 전체정보", message_info);
    socket?.emit("send_message", {
      roomnumber: "5",
      message_info,
    });
    set_input_msg("");
  };

  return {
    input_msg,
    debounced,
    inputChange,
    sendMsg,
    blankChk: input_msg.trim().length > 0,
    limit_text: 300 - input_msg.length,
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
  };
};

export default useChatInput;
