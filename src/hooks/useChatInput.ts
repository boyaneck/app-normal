import { useSocketStore } from "@/store/socket_store";
import useUserStore from "@/store/user";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

interface props {
  current_host_id: string;
  inputRef: React.RefObject<HTMLInputElement>;
}
const useChatInput = ({ current_host_id, inputRef }: props) => {
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

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 250) set_input_msg(e.target.value);
  };

  const chkTextLength = useCallback(() => {
    const text_length = inputRef?.current;
    if (!text_length) return;

    const original_height = text_length.style.height;
    text_length.style.height = "auto";
    const scroll_length = text_length.scrollHeight;
    text_length.style.height = original_height;

    set_text_length_X(scroll_length);

    const max_height_X = 4.5 * 16;
    set_text_overflow(scroll_length > max_height_X);
  }, []);

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
    set_debounced("");
  };

  useEffect(() => {
    const time_out = setTimeout(() => {
      set_debounced(input_msg);
    }, 5000);

    return () => {
      clearTimeout(time_out);
    };
  }, [input_msg]);

  return {
    input_msg,
    debounced,
    inputChange,
    sendMsg,
    blankChk: input_msg.trim().length > 0,
    limit_text: 300 - input_msg.length,
  };
};

export default useChatInput;
