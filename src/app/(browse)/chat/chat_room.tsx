import React, { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Picker from "emoji-picker-react";
import PaymentPage from "../_components/payment/payment";
import useUserStore from "../../../store/user";
import {
  animated_heart,
  chat_props,
  heart,
  remove_message_props,
} from "../../../types/chat";
import { useSocketStore } from "@/store/socket_store";
import { getChatInfo } from "@/api/chat";
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
  console.log("메세지 확인", message);
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [receive_message_info]);
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

  const onEmojiClick = (event: any, emojiObject: any) => {
    set_message((prev) => prev + event.emoji);
    // message_input_ref.current?.focus();
  };

  const onHandlerSendMessage = () => {
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

  const onHandlerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_message(e.target.value);
  };

  const max_messages = 6; // 최대 메시지 개수

  const AnimatedMessage = ({
    message,
    is_visible,
    avatar_url,
  }: remove_message_props) => {
    return (
      <>
        <span>
          <img
            className="w-6 h-6 object-cover bg-gray-400 rounded-full inline-block "
            src={avatar_url}
            alt=""
          />
          <span className="pl-1 pb-1 pt-2 relative top-1 text-xs">아이디</span>
        </span>

        <div
          className={
            is_visible ? "animate-fadeOutUp pt-1 text-sm" : "pt-1 text-sm"
          }
        >
          {message}
        </div>
      </>
    );
  };

  const handleHeartClick = () => {
    // 새로운 하트 추가
    const id = Date.now();
    console.log("하트의 타입은", typeof id);
    set_hearts([{ id }]);
    //실시간 채팅이기에 해당 콘텐츠에 대한 좋아요가 아니라서 한번만 누를수 있도록 해야함함
    // set_hearts(([prev_hearts]) => [...[prev_hearts], { id: Date.now() }]);
  };

  console.log("하트 확인하기", hearts);
  const handlerAnimationEnd = ({ id }: heart) => {
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

  const AnimatedHeart = ({ onAnimationEnd, id }: animated_heart) => {
    const [is_visible, set_is_visible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        set_is_visible(false);
        onAnimationEnd({ id: id }); // 애니메이션 종료 후 콜백 호출
      }, 800); // 애니메이션 시간과 동일하게 설정

      return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    return is_visible ? (
      <div className="animate-heartWave text--500 text-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2">
        ❤️
      </div>
    ) : null;
  };

  return (
    <div className="flex h-full justify-end">
      <div className="w-2/5 h-4/5 grid grid-rows-10 border  ">
        <div className=" row-span-9 ">
          <div className="pl-4">
            {receive_message_info.map((message_info) => {
              const isRemoving = message_remove === message_info;
              return (
                <AnimatedMessage
                  message={`${message_info.user_nickname}: ${message_info.message}`}
                  is_visible={isRemoving}
                  avatar_url={message_info.avatar_url}
                />
              );
            })}
          </div>
        </div>
        <div className="row-span-1">
          <span className="flex flex-row h-full">
            <input
              placeholder="메세지를 입력해주세요"
              ref={message_input_ref}
              value={message}
              onChange={onHandlerInput}
              className=" bg-transparent border border-purple-400 w-2/3 h-full rounded-full"
            ></input>
            <button
              onClick={onHandlerSendMessage}
              className="hover hover:cursor-pointer"
            >
              전송
            </button>
            <button
              className="relative"
              onClick={() => set_show_emoji_picker(!show_emoji_picker)}
            >
              🙂
              {show_emoji_picker && (
                <div className="absolute bottom-full left-0 z-10 transform scale-75 translate-x-[-30%] translate-y-[12.5%]">
                  <Picker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </button>
            <button className="relative" onClick={handleHeartClick}>
              {hearts.map((heart) => (
                <AnimatedHeart
                  key={heart?.id}
                  id={heart?.id}
                  onAnimationEnd={handlerAnimationEnd}
                  // className="absolute bottom-full left-0"
                />
              ))}
              ❤️
            </button>
            <span className="flex justify-center items-center ">
              <PaymentPage current_host_nickname={current_host_nickname} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
