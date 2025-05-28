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
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [selected_option, set_selected_option] = useState<string | null>(null);
  const [option_is_selected, set_option_is_selected] = useState(false);
  const [selected_warning_reason, set_selected_warning_reason] = useState<
    string | null
  >(null);
  const option_data = [
    { id: "opt1", reason: "원치 않는 상업성 콘텐츠 또는 스팸" },
    { id: "opt2", reason: "증오심 표현 또는 노골적인 폭력" },
    { id: "opt3", reason: "테러 조장" },
    { id: "opt4", reason: "괴롭힘 또는 폭력" },
    { id: "opt5", reason: "자살 또는 자해" },
    { id: "opt6", reason: "잘못된 정보" },
    { id: "opt7", reason: "음란물" },
  ];

  const onHandlerSelectOption = (reason: string) => {
    if (selected_option === reason) {
      set_selected_option(null);
    }

    set_selected_option(reason);
    console.log("이유를 대라!!!!!!!!", reason);
  };
  const onHandlerOpenWarningModal = () => {
    set_is_modal_open(true);
  };
  const onHandlerCloseWarningModal = () => {
    set_is_modal_open(false);
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

  const [selected_message_for_modal, set_selected_message_for_modal] =
    useState<remove_message_props | null>(null);
  const openMessageModal = ({
    message,
    is_visible,
    avatar_url,
    user_id,
    user_nickname,
    user_email,
  }: remove_message_props) => {
    set_selected_message_for_modal({
      message,
      is_visible,
      avatar_url,
      user_id,
      user_nickname,
      user_email,
    });
  };
  const AnimatedMessage = ({
    message,
    is_visible,
    avatar_url,
    user_id,
    user_nickname,
    user_email,
  }: remove_message_props) => {
    return (
      <span
        className=""
        onClick={() => {
          openMessageModal({
            message,
            is_visible,
            avatar_url,
            user_id,
            user_nickname,
            user_email,
          });
          set_is_modal_open(true);
        }}
      >
        <div
          className="group cursor-pointer hover:font-bold hover:shadow-xl hover:scale-[1.02]
        transition-all duration-200 ease-in-out rounded-sm 
        "
        >
          <span>
            <img
              className="w-6 h-6 object-cover bg-gray-400 rounded-full inline-block "
              src={avatar_url}
              alt=""
            />
            <span className="pl-1 pb-1 pt-2  bottom-0.5 text-xs">아이디</span>
          </span>
          <div
            className={
              is_visible ? "animate-fadeOutUp pt-1 text-sm" : "pt-1 text-sm"
            }
          >
            {message}
          </div>
        </div>
      </span>
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

  const selectWarningOption = (reason: string) => {
    if (selected_warning_reason === reason) set_selected_warning_reason("");
    console.log("경고 사유", selected_warning_reason);
    console.log("휘뚜루마뚜루");
  };

  return (
    <div className="flex h-full justify-end ">
      <div className="w-5/6 h-4/5 grid grid-rows-10 border border-purple-400   ">
        <div className=" row-span-9 ">
          <div className="pl-4 relative ">
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
                />
              );
            })}
            {is_modal_open && (
              <div className="bg-white-300  border-red-400 absolute top-7 bg-red-300 w-4/5 h-4/5">
                <button
                  className="absolute top-3 right-3 text-gray-500  "
                  onClick={() => {
                    set_is_modal_open(false);
                  }}
                >
                  취소 (x)
                </button>

                <span className="w-10 h-10 rounded-full border border-black"></span>
                <span>ID:{selected_message_for_modal?.user_nickname} </span>
                <div className="border border-black">
                  {selected_message_for_modal?.message}를
                </div>
                <div className="space-y-2">
                  <div
                    className="hover:shadow-lg
                         rounded-lg 
                         border
                       border-gray-300
                       bg-white 
                         cursor-pointer 
                         transfrom transition-all duration-300 ease-in-out 
                         text-sm"
                  ></div>
                  <div>
                    {option_data.map((option) => (
                      <div
                        onClick={() => {
                          selectWarningOption(option.reason);
                          set_selected_warning_reason(option.reason);
                        }}
                        key={option.id}
                        className={clsx(
                          `hover:shadow-lg
                          mt-2
                     rounded-lg 
                     border
                   border-gray-300
                   bg-white 
                     cursor-pointer 
                     transfrom transition-all duration-300 ease-in-out 
                     text-sm`,
                          {
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-auto min-w-[200px] text-center shadow-xl":
                              selected_warning_reason === option.reason,
                          }
                          // {
                          //   "hover:shoadow-lg": !selected_option,
                          // },
                          // {
                          //   "fixed-top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2":
                          //     selected_option,
                          //   "bg-blue-500 text-white shadow-xl z-20 ":
                          //     selected_option,
                          //   "font-medium": selected_option,
                          // }
                        )}
                      >
                        {option.reason}
                      </div>
                    ))}
                    {selected_warning_reason !== null ? (
                      <span>
                        <button>전송하기</button>
                      </span>
                    ) : (
                      <span></span>
                    )}
                  </div>
                </div>
              </div>
            )}
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
