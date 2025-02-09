import { getChatInfo, insertChatInfo } from "@/api/chat";
import { useChatRoomInfo } from "@/store/chat_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const ChatRoom = () => {
  // const [message, setmessage] = useState("");
  // const [receiveMessageInfo, setReceiveMessageInfo] = useState<
  //   props_message_info[]
  // >([]);
  // const [welcomeMessage, setWelcomeMessage] = useState("");
  // const [messageInfo, setMessageInfo] = useState({});
  // const { chatRoomInfo } = useChatRoomInfo();
  // const socket = io("http://localhost:3001/room", {
  //   transports: ["websocket"],
  // });
  // const userInfo = useUserStore((state) => state.user);
  // const { currentChatRoomNumber } = useCurrentChatRoomStore();
  // const chat_room_number = currentChatRoomNumber;
  // const { isChatRoomOpened, setIsChatRoomOpened } = useChatRoomOpenStore(
  //   (state) => state
  // );
  // const { rooms, setMessages } = useChatStore();

  // const { data: chatInfo } = useQuery(
  //   queryFn: getChatInfo,
  // });
  // console.log("data가 나오나 ?", chatInfo);

  // useEffect(() => {
  //   socket.on("receiveMessage", (messageInfo: props_message_info) => {
  //     setReceiveMessageInfo((prev) => [...prev, messageInfo]);
  //   });

  //   return () => {};
  // }, [socket, rooms]);

  // socket.on("welcomeMessage", (welcomeMsg) => {
  //   setWelcomeMessage(welcomeMsg);
  // });

  // let onHandlerSendMessage = () => {
  //   const user_nickname = userInfo?.user_nickname;

  //   // const user_nickname = "ITZY 유나"
  //   const avatar_url = userInfo?.avatar_url;
  //   const id = userInfo?.id;
  //   const email = userInfo?.email;
  //   const created_at = dayjs().toISOString();
  //   console.log("유저닉네임이 배열인가요 아닌가요??", user_nickname);
  //   const messageInfo = {
  //     user_nickname,
  //     avatar_url,
  //     message,
  //     created_at,
  //     id,
  //     email,
  //     chat_room_number,
  //   };
  //   socket.emit("sendMessage", {
  //     roomnumber: chat_room_number,
  //     messageInfo,
  //   });
  //   alert(
  //     "메시지전송" +
  //       JSON.stringify(messageInfo) +
  //       "유저이름" +
  //       JSON.stringify(messageInfo.user_nickname)
  //   );
  //   insertChatInfo({
  //     user_nickname,
  //     avatar_url,
  //     message,
  //     created_at,
  //     chat_room_number,
  //   });
  //   setMessages(chat_room_number, [messageInfo]);
  //   console.log("아니 시발 진짜 왜 안됨", user_nickname);
  //   //방번호 보내기
  // };

  // const current_room_info = rooms[chat_room_number];

  return (
    <div>
      <section>s</section>
      <section>그 외의 유저들 </section>
      ChatRoom 입니다 안녕하세요
      <input placeholder="메세지를 입력해주세요"></input>
      <button>전송</button>
    </div>
  );
};

export default ChatRoom;
