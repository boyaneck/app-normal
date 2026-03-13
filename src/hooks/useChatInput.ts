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
  const [is_hover, set_is_hover] = useState<boolean>(false);
  const [is_overflow, set_is_overflow] = useState<boolean>(false);

  const { socket, connect_socket } = useSocketStore();
  const user_info = useUserStore((state) => state.user);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. 소켓 연결 관리
  useEffect(() => {
    if (!socket) connect_socket();
    return () => {
      socket?.off("receive_message");
    };
  }, [socket, connect_socket]);

  // 2. 입력 핸들러 (글자수 제한 포함)
  const inputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 300) {
      set_input_msg(e.target.value);
    }
  };

  // 3. 마우스 진입/이탈 핸들러
  const mouseEnter = () => set_is_hover(true);

  const mouseLeave = useCallback(() => {
    set_is_hover(false);
    if (textareaRef.current) {
      // textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      textareaRef.current.scrollTo({
        top: textareaRef.current.scrollHeight,
        behavior: "auto",
      });
    }
    // 애니메이션(축소)이 끝난 뒤 스크롤 위치를 0으로 초기화
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, TRANSITION_DURATION_MS);
  }, []);

  // 4. [핵심] 높이 계산 및 확장 로직
  useEffect(() => {
    const tx = textareaRef.current;
    const wrap = wrapperRef.current;
    if (!tx || !wrap) return;

    const currentWrapHeight = wrap.style.height;

    // [수정된 부분]
    // 1. 측정할 때만 0px로 리셋합니다.
    // 이미 확장(is_hover && is_overflow)된 상태라면 리셋을 건너뛰어야 떨리지 않습니다.
    if (!(is_hover && is_overflow)) {
      tx.style.height = "0px";
    }

    // 2. 이 아래에 있던 중복된 tx.style.height = "0px"; 줄은 반드시 삭제해야 합니다!
    const curr_scroll_height = tx.scrollHeight;

    // 2. 오버플로우 판단
    const hasOverflow = curr_scroll_height > LIMIT_HEIGHT_PX;
    set_is_overflow(hasOverflow);

    const expand = is_hover && hasOverflow;
    const targetHeight = expand ? curr_scroll_height : FIXED_HEIGHT_PX;

    // 3. 높이 적용
    if (currentWrapHeight !== `${targetHeight}px`) {
      wrap.style.height = `${targetHeight}px`;
    }

    tx.style.height = "100%";

    // expand 상태일 때는 텍스트가 다 보이니까 스크롤이 필요 없고(hidden),
    // 줄어든 상태일 때는 스크롤이 가능해야 합니다(auto).
    tx.style.overflowY = expand ? "hidden" : "auto";

    // 4. 텍스트 고정
    if (!expand) {
      tx.scrollTop = tx.scrollHeight;
    }
  }, [is_hover, input_msg, LIMIT_HEIGHT_PX, FIXED_HEIGHT_PX, is_overflow]); // is_overflow 추가
  // 5. 메시지 전송 로직
  const sendMsg = () => {
    if (!input_msg.trim()) return;

    const message_info = {
      current_host_id,
      user_nickname: user_info?.user_nickname,
      avatar_url: user_info?.avatar_url,
      message: input_msg,
      date: dayjs().toISOString(),
      id: user_info?.user_id,
      email: user_info?.user_email,
      current_chat_room_number: "5",
    };

    socket?.emit("send_message", {
      roomnumber: "5",
      message_info,
    });

    set_input_msg("");
  };

  return {
    input_msg,
    inputChange,
    sendMsg,
    blankChk: input_msg.trim().length > 0,
    limit_text: 300 - input_msg.length,
    wrapperRef,
    textareaRef,
    mouseLeave,
    is_overflow,
    is_hover,
    mouseEnter,
  };
};

export default useChatInput;
