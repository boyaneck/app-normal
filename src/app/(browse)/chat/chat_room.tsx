import { getChatInfo, insertChatInfo } from "@/api/chat";
import { useChatRoomInfo } from "@/store/chat_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import dayjs from "dayjs";
import { useSocketStore } from "@/store/socket_store";
import useCreateChat from "@/hooks/useChat";

const ChatRoom = () => {
  const [message, set_message] = useState("");
  const [receive_message_info, set_receive_message_info] = useState<
    props_message_info[]
  >([]);

  const { createChatRoom } = useCreateChat();
  dayjs.locale("ko"); // 로케일 설정

  const user_info = useUserStore((state) => state.user);
  const { socket, connect_socket, disconnect_socket } = useSocketStore();

  const { data: chat_info } = useQuery<props_message_info[]>({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  console.log("유즈쿼리", chat_info);

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
  const message_input_ref = useRef<HTMLInputElement>(null);

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
      message: input_message,
      date,
      id,
      email,
      current_chat_room_number,
    };
    socket?.emit("send_message", {
      roomnumber: "5",
      message_info,
    });

    // insertChatInfo({
    //   user_nickname,
    //   avatar_url,
    //   message,
    //   date,
    //   current_chat_room_number,
    // });
    // set_message(chat_room_number, [message_info]);
    // set_receive_message_info([message_info]);
    //방번호 보내기
  };

  // const current_room_info = rooms[chat_room_number];

  return (
    <div className="flex flex-col">
      <section>s</section>
      <section>그 외의 유저들 </section>
      <input
        placeholder="메세지를 입력해주세요"
        // value={message}
        // onChange={(e) => set_message(e.target.value)}
        ref={message_input_ref}
      ></input>

      <button onClick={onHandlerSendMessage}>전송</button>
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
