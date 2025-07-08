import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Picker from "emoji-picker-react";
import PaymentPage from "../_components/payment/payment";
import useUserStore from "../../../store/user";
import axios from "axios";
import {
  animated_heart,
  chat_props,
  heart,
  remove_message_props,
  warning_chat,
} from "../../../types/chat";
import { useSocketStore } from "@/store/socket_store";
import { getChatInfo } from "@/api/chat";
import clsx from "clsx";
import { max_messages, option_data, sanction_duration } from "@/utils/chat";
import { AnimatedHeart } from "./_components/animated_heart";
import { AnimatedMessage } from "./_components/animated_message";
import { ChatInput } from "./_components/chat_input";
import ChatSanction from "./_components/chat_sanction";
interface Props {
  current_host_nickname: string;
}
const ChatRoom = ({ current_host_nickname }: Props) => {
  const [receive_message_info, set_receive_message_info] = useState<
    chat_props[]
  >([]);
  const [show_emoji_picker, set_show_emoji_picker] = useState(false);
  const [message, set_message] = useState("");
  const message_input_ref = useRef(null);
  const chatContainerRef = useRef(null); // 채팅 컨테이너 ref 생성
  const user_info = useUserStore((state) => state.user);
  const { socket, connect_socket } = useSocketStore();
  const [message_remove, set_message_remove] = useState(null);
  const [hearts, set_hearts] = useState<heart[]>([]); // 하트 목록 상태

  const [selected_option, set_selected_option] = useState<string | null>(null);
  const [option_is_selected, set_option_is_selected] = useState(false);
  const [selected_warning_reason, set_selected_warning_reason] = useState<
    string | null
  >(null);
  const [selected_message_for_modal, set_selected_message_for_modal] =
    useState<remove_message_props | null>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);
  const onHandlerSelectOption = (reason: string) => {
    if (selected_option === reason) {
      set_selected_option(null);
    }

    set_selected_option(reason);
    console.log("이유를 대라!!!!!!!!", reason);
  };

  const [is_warning_modal, set_is_warning_modal] = useState(false);
  useEffect(() => {
    if (!socket) {
      connect_socket();
    }
    if (socket) {
      socket.on("receive_message", (message_info) => {
        set_receive_message_info((prev) => [...prev, message_info]);
      });
    }
    return () => {
      socket?.off("receive_message");
    };
  }, [socket, connect_socket]);

  const { data: chat_info } = useQuery({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  const emojiClick = (event: any, emojiObject: any) => {
    set_message((prev) => prev + event.emoji);
    // message_input_ref.current?.focus();
  };

  const sendMessage = () => {
    const user_nickname = user_info?.user_nickname;
    const avatar_url = user_info?.avatar_url;
    const id = user_info?.user_id;
    const email = user_info?.user_email;
    const date = dayjs().toISOString();
    const current_chat_room_number = "5";
    const message_info = {
      user_nickname,
      avatar_url,
      message,
      date,
      id,
      email,
      current_chat_room_number,
    };
    socket?.emit("send_message", {
      roomnumber: "5",
      message_info,
    });
    set_message("");
  };

  const chatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_message(e.target.value);
  };

  const OnHandlerWarningUser = async ({
    user_id,
    user_nickname,
    user_email,
    message,
    reason,
  }: warning_chat) => {
    const WARNING_USER_API_URL = process.env
      .NEXT_PUBLIC_WARNING_USER_API_URL as string;
    set_is_modal_open(true);
    const payload = {
      action: "warn",
      user_id,
      user_nickname,
      user_email,
      message,
    };
    try {
      const response = await axios.post(WARNING_USER_API_URL, payload);
      console.log("채팅 정지 관련 post", response);
    } catch (error) {}
  };

  const heartClick = () => {
    // 새로운 하트 추가
    const id = Date.now();
    console.log("하트의 타입은", typeof id);
    set_hearts([{ id }]);
    //실시간 채팅이기에 해당 콘텐츠에 대한 좋아요가 아니라서 한번만 누를수 있도록 해야함함
    // set_hearts(([prev_hearts]) => [...[prev_hearts], { id: Date.now() }]);
  };

  console.log("하트 확인하기", hearts);
  const heartAnimationEnd = ({ id }: heart) => {
    //여기서 하트 카운트를 세고 ,
    set_hearts(([prev_hearts]) =>
      [prev_hearts].filter((heart) => heart?.id !== id)
    );
  };

  useEffect(() => {
    if (receive_message_info.length > max_messages) {
      // 사라질 메시지 설정
      set_message_remove(receive_message_info[0]);

      // 0.3초 후에 메시지 목록에서 제거
      setTimeout(() => {
        set_receive_message_info((prev) => prev.slice(1));
        set_message_remove(null);
      }, 300);
    }
  }, [receive_message_info]);

  const selectWarningOption = (reason: string) => {
    if (selected_warning_reason === reason) {
      set_selected_warning_reason(null);
    } else set_selected_warning_reason(reason);
  };
  const sendSanctionInfo = async () => {
    alert("전송");
    //HTTP POST 로 보내기기
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_SANCTION_USER_API_URL as string
        // selected_message_for_modal()
      );
      console.log("채팅 정지 관련 post", response);
    } catch (error) {}
  };

  return (
    <div className="w-5/6 h-4/5 grid grid-rows-10 border relative bg-transparent">
      <div className=" row-span-9 relative">
        {/* --채팅메세지 */}
        <div className="">
          {receive_message_info.map((message_info) => {
            const isRemoving = message_remove === message_info;
            return (
              <AnimatedMessage
                message={`${message_info.user_nickname}: ${message_info.message}`}
                is_visible={isRemoving}
                avatar_url={message_info.avatar_url}
                user_nickname={message_info.user_nickname}
                user_id={message_info.id}
                user_email={message_info.email}
                selected_message_for_modal={selected_message_for_modal}
                set_selected_message_for_modal={set_selected_message_for_modal}
                is_modal_open={is_modal_open}
                set_is_modal_open={set_is_modal_open}
              />
            );
          })}
        </div>
        {/* --채팅메세지 */}

        {is_modal_open && (
          //모달창

          <ChatSanction
            set_is_modal_open={set_is_modal_open}
            is_modal_open={is_modal_open}
            set_selected_message_for_modal={set_selected_message_for_modal}
            selected_message_for_modal={selected_message_for_modal}
            selectWarningOption={selectWarningOption}
            set_selected_warning_reason={set_selected_warning_reason}
            selected_warning_reason={selected_warning_reason}
          />
        )}
        {/* <div className=" absolute top-2 z-10  bg-red-400 border rounded-xl border-black w-4/5 h-10 flex items-center left-1/2 -translate-x-1/2 "></div> */}
      </div>

      <div className="row-span-1">
        <ChatInput
          chatInput={chatInput}
          sendMessage={sendMessage}
          set_show_emoji_picker={set_show_emoji_picker}
          show_emoji_picker={show_emoji_picker}
          emojiClick={emojiClick}
          heartClick={heartClick}
          set_hearts={set_hearts}
          hearts={hearts}
          heartAnimationEnd={heartAnimationEnd}
          current_host_nickname={current_host_nickname}
          message={message}
          set_message={set_message}
        />
      </div>
    </div>
  );
};
export default ChatRoom;
