import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getChatInfo } from "@/api/chat"; // 올바른 경로로 수정
import useUserStore from "@/store/user";
import { useSocketStore } from "@/store/socket_store";
import Picker from "emoji-picker-react";

const ChatRoom = () => {
  const [receive_message_info, set_receive_message_info] = useState([]);
  const [show_emoji_picker, set_show_emoji_picker] = useState(false);
  const [message, set_message] = useState("");
  const message_input_ref = useRef(null);
  const chatContainerRef = useRef(null); // 채팅 컨테이너 ref 생성
  const user_info = useUserStore((state) => state.user);
  const { socket, connect_socket } = useSocketStore();
  const [messageToRemove, setMessageToRemove] = useState(null);
  const [hearts, setHearts] = useState([]); // 하트 목록 상태

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [receive_message_info]);

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

  const onEmojiClick = (event, emojiObject) => {
    set_message((prev) => prev + event.emoji);
    message_input_ref.current?.focus();
  };

  const onHandlerSendMessage = () => {
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

  const OnHandlerInput = (e) => {
    set_message(e.target.value);
  };

  const MAX_MESSAGES = 6; // 최대 메시지 개수

  const AnimatedMessage = ({ message, isVisible }) => {
    return (
      <div className={isVisible ? "animate-fadeOutUp" : ""}>{message}</div>
    );
  };

  const handleHeartClick = () => {
    // 새로운 하트 추가
    setHearts((prevHearts) => [...prevHearts, { id: Date.now() }]);
  };

  const handleAnimationEnd = (id) => {
    // 애니메이션이 종료된 하트 제거
    setHearts((prevHearts) => prevHearts.filter((heart) => heart.id !== id));
  };

  useEffect(() => {
    if (receive_message_info.length > MAX_MESSAGES) {
      // 사라질 메시지 설정
      setMessageToRemove(receive_message_info[0]);

      // 0.3초 후에 메시지 목록에서 제거
      setTimeout(() => {
        set_receive_message_info((prev) => prev.slice(1));
        setMessageToRemove(null);
      }, 300);
    }
  }, [receive_message_info]);

  const AnimatedHeart = ({ onAnimationEnd, id }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onAnimationEnd(id); // 애니메이션 종료 후 콜백 호출
      }, 800); // 애니메이션 시간과 동일하게 설정

      return () => clearTimeout(timer);
    }, [onAnimationEnd, id]);

    return isVisible ? (
      <div className="animate-heartWave text-red-500 text-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2">
        ❤️
      </div>
    ) : null;
  };

  return (
    <div className="flex flex-col h-full relative">
      {show_emoji_picker && <Picker onEmojiClick={onEmojiClick} />}
      <div ref={chatContainerRef} className="overflow-y-auto flex-1">
        {receive_message_info.map((message_info) => {
          const isRemoving = messageToRemove === message_info;
          return (
            <AnimatedMessage
              key={message_info.date}
              message={`${message_info.user_nickname}: ${message_info.message}`}
              isVisible={isRemoving}
            />
          );
        })}
      </div>
      <span className="flex items-center">
        <input
          placeholder="메세지를 입력해주세요"
          ref={message_input_ref}
          value={message}
          onChange={OnHandlerInput}
          className="flex-grow bg-transparent"
        ></input>
        <button onClick={onHandlerSendMessage}>전송</button>
        <button onClick={() => setShowEmojiPicker(!show_emoji_picker)}>
          이모지
        </button>
        <button onClick={handleHeartClick}>❤️</button> {/* 하트 버튼 */}
      </span>
      <div className="absolute bottom-10 left-0 w-full h-10">
        {/* 하트 아이콘이 나타날 영역 */}
        {hearts.map((heart) => (
          <AnimatedHeart
            key={heart.id}
            id={heart.id}
            onAnimationEnd={handleAnimationEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatRoom;
