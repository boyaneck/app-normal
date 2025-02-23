import { getChatInfo, insertChatInfo } from "@/api/chat";
import { useChatRoomInfo } from "@/store/chat_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import dayjs from "dayjs";
import { useSocketStore } from "@/store/socket_store";
import useCreateChat from "@/hooks/useChat";
import Picker from "emoji-picker-react";
const ChatRoom = () => {
  const [receive_message_info, set_receive_message_info] = useState<
    props_message_info[]
  >([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, set_emoji] = useState("");
  const [input_value, set_input_value] = useState("");
  const combined = emoji + input_value;

  const [message, set_message] = useState("");
  const message_input_ref = useRef<HTMLInputElement>(null);
  const onEmojiClick = (event: any, emojiObject: any) => {
    console.log("이모지", event.emoji);
    set_message((prev) => prev + event.emoji);
    message_input_ref.current?.focus(); // 포커스 유지 (선택적)
  };
  const { createChatRoom } = useCreateChat();
  dayjs.locale("ko"); // 로케일 설정

  const user_info = useUserStore((state) => state.user);
  const { socket, connect_socket, disconnect_socket } = useSocketStore();

  const { data: chat_info } = useQuery<props_message_info[]>({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  useEffect(() => {
    if (!socket) {
      connect_socket();
    }
    if (socket) {
      socket?.on("receive_message", (message_info) => {
        console.log("서버로 부터 온 메세지", message_info);
        set_receive_message_info((prev) => [...prev, message_info]);
      });
    }
    return () => {};
  }, [socket]);

  let onHandlerSendMessage = () => {
    const input_message = message_input_ref.current?.value || "";
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

  const msg = () => {
    console.log("바뀌나요 ?");
  };

  const OnHandlerInput = (e: any) => {
    set_message(e.target.value);
  };

  console.log("콘솔 확인하기,");
  return (
    <div className="flex flex-col">
      <section>s</section>
      <section>그 외의 유저들 </section>
      <input
        placeholder="메세지를 입력해주세요"
        ref={message_input_ref}
        value={message}
        onChange={OnHandlerInput}
      ></input>
      <button onClick={onHandlerSendMessage}>전송</button>
      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        이모지
      </button>
      {showEmojiPicker && <Picker onEmojiClick={onEmojiClick} />}
      {chat_info?.map((chat_info) => {
        return <div>{chat_info.message}</div>;
      })}
      <div>
        {receive_message_info.map((message_info) => {
          return (
            <div>
              {message_info.user_nickname}:{message_info.message}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatRoom;
