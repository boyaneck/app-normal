import { getChatInfo, insertChatInfo } from "@/api/chat";
import { useChatRoomInfo } from "@/store/chat_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import dayjs from "dayjs";

const ChatRoom = () => {
  const [message, set_message] = useState("");
  const [receive_message_info, set_receive_message_info] = useState<
    props_message_info[]
  >([]);
  const [welcome_message, set_welcome_message] = useState("");
  const [message_info, set_message_info] = useState({});

  const socket = io("http://localhost:3001/room", {
    transports: ["websocket"],
  });
  dayjs.locale("ko"); // 로케일 설정

  console.log("쭈르르릅");
  const user_info = useUserStore((state) => state.user);

  const { data: chatInfo } = useQuery({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  useEffect(() => {
    socket.on("connect", () => {
      alert("연결성공");
      console.log("연결성공");
    });
    socket.on("receive_message", (message_info: props_message_info) => {
      set_receive_message_info((prev) => [...prev, message_info]);
    });

    return () => {};
  }, [socket]);

  // socket.on("welcomeMessage", (welcomeMsg) => {
  //   setWelcomeMessage(welcomeMsg);
  // });

  let onHandlerSendMessage = () => {
    const user_nickname = user_info?.user_nickname;

    // const user_nickname = "ITZY 유나"
    const avatar_url = user_info?.avatar_url;
    const id = user_info?.user_id;
    const email = user_info?.user_email;
    const created_at = dayjs().toISOString();
    console.log("유저닉네임이 배열인가요 아닌가요??", message);
    const message_info = {
      user_nickname,
      avatar_url,
      message,
      created_at,
      id,
      email,
      // chat_room_number,
    };
    socket.emit("send_message", {
      roomnumber: 5,
      message_info,
    });
    alert(
      "메시지전송" +
        JSON.stringify(message_info) +
        "유저이름" +
        JSON.stringify(message_info.user_nickname)
    );
    // insertChatInfo({
    //   user_nickname,
    //   avatar_url,
    //   message,
    //   created_at,
    //   chat_room_number,
    // });
    // setMessages(chat_room_number, [message_info]);
    console.log("아니진짜 왜 안됨", user_nickname);
    //방번호 보내기
  };

  console.log("메세지 확인하기", receive_message_info);
  // const current_room_info = rooms[chat_room_number];

  return (
    <div>
      <section>s</section>
      <section>그 외의 유저들 </section>
      <section>{}</section>
      ChatRoom 입니다 안녕하세요
      <input
        placeholder="메세지를 입력해주세요"
        value={message}
        onChange={(e) => set_message(e.target.value)}
      ></input>
      <button onClick={onHandlerSendMessage}>전송</button>
    </div>
  );
};

export default ChatRoom;
