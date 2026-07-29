import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
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
import { useSocketStore } from "@/store/socket-store";
import { getChatInfo } from "@/api/chat";
import clsx from "clsx";
import { max_messages, option_data, sanction_duration } from "@/utils/chat";
import { AnimatedHeart } from "./_components/animated_heart";
import { AnimatedMessage } from "./_components/animated_message";
import { ChatInput } from "./_components/chat_input";
import ChatSanction from "./_components/chat_sanction";
import { useSidebarStore, useStreamingBarStore } from "@/store/bar-store";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
interface Props {
  current_host_nickname: string;
  current_host_id: string;
}
const ChatRoom = ({ current_host_nickname, current_host_id }: Props) => {
  console.log("현재 스트리머의 아이디 인데 ???", current_host_id);
  const icon = useStreamingBarStore((state) => state.icon);
  const [receive_message_info, set_receive_message_info] = useState<any[]>([]);
  const [show_emoji_picker, set_show_emoji_picker] = useState(false);
  const [message, set_message] = useState("");
  const message_input_ref = useRef(null);
  const chatContainerRef = useRef(null); // 채팅 컨테이너 ref 생성
  const user_info = useUserStore((state) => state.user);
  const { socket, connectSocket } = useSocketStore();
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
  const [donation_burst, set_donation_burst] = useState(0);
  const [show_donation_burst, set_show_donation_burst] = useState(false);
  const donation_burst_id_ref = useRef(0);

  const triggerDonationBurst = () => {
    const id = donation_burst_id_ref.current + 1;
    donation_burst_id_ref.current = id;
    set_donation_burst(id);
    set_show_donation_burst(true);
    // hover를 계속 유지해도 터지는 이펙트는 한 번 재생되고 끝 — 다시 hover에 들어와야 재생
    setTimeout(() => {
      if (donation_burst_id_ref.current === id) set_show_donation_burst(false);
    }, 700);
  };
  const onHandlerSelectOption = (reason: string) => {
    if (selected_option === reason) {
      set_selected_option(null);
    }

    set_selected_option(reason);
    console.log("이유를 대라!!!!!!!!", reason);
  };

  useEffect(() => {
    if (!socket) {
      connectSocket();
      return;
    }
    socket.emit("join_room", { hostId: current_host_id });
    socket.on("receive_msg", (msg) => {
      set_receive_message_info((prev) => [...prev, msg]);
    });

    // 서버 재시작 등으로 재연결됐을 때 room에 다시 join (안 하면 브로드캐스트를 못 받음)
    const rejoinRoom = () => {
      socket.emit("join_room", { hostId: current_host_id });
    };
    socket.io.on("reconnect", rejoinRoom);

    return () => {
      socket?.off("receive_msg");
      socket.io.off("reconnect", rejoinRoom);
    };
  }, [socket, connectSocket, current_host_id]);

  const { data: chat_info } = useQuery({
    queryKey: ["getChatInfo"],
    queryFn: getChatInfo,
  });

  const emojiClick = (event: any, emojiObject: any) => {
    set_message((prev) => prev + event.emoji);
    // message_input_ref.current?.focus();
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

  const heartAnimationEnd = ({ id }: heart) => {
    //여기서 하트 카운트를 세고 ,
    set_hearts(([prev_hearts]) =>
      [prev_hearts].filter((heart) => heart?.id !== id),
    );
  };

  useEffect(() => {
    // 채팅 박스 높이를 넘치면(스크롤 생기면) 애니메이션 없이 바로 가장 오래된 메시지 제거
    const el = chatContainerRef.current;
    if (el && el.scrollHeight > el.clientHeight && receive_message_info.length > 0) {
      set_receive_message_info((prev) => prev.slice(1));
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
        process.env.NEXT_PUBLIC_SANCTION_USER_API_URL as string,
        // selected_message_for_modal()
      );
      console.log("채팅 정지 관련 post", response);
    } catch (error) {}
  };
  const [is_chat_active, set_is_chat_active] = useState(false); // 사라지는 중인지 상태
  useEffect(() => {
    const isChatActive = icon.includes("chat");

    if (isChatActive) {
      set_is_chat_active(false);
    } else {
      set_is_chat_active(true); // 먼저 사라지는 상태로 만들고
      const timer = setTimeout(() => {}, 300);
    }
  }, [icon]);
  const [is_pm_modal_open, set_is_pm_modal_open] = useState<boolean>(false);
  const [id_target, set_id_target] = useState<HTMLElement | null>(null);
  const [money_amount, set_money_amount] = useState("");

  const [ref_target, set_ref_target] = useState<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (paymentRef.current) {
      set_id_target(paymentRef.current);
    }
  }, []); // 마운트 시 한 번 실행되어 ref를 state에 담음

  console.log("왜 fasle 가 안ㄷ욈 >", is_pm_modal_open);
  return (
    <div
      className={clsx(
        `grid grid-rows-10
          w-full h-full
          rounded-xl
          overflow-hidden 
          relative
          `,
      )}
    >
      <div
        className=" row-span-9 flex flex-col-reverse overflow-hidden "
        id={"payment-modal-target"}
        ref={(node) => {
          paymentRef.current = node;
          chatContainerRef.current = node;
          if (node) set_id_target(node);
        }}
      >
        {/* --채팅메세지 */}
        <div className="">
          {receive_message_info.map((msg) => {
            return (
              <AnimatedMessage
                key={msg.msgId}
                message={`${msg.userNickname}: ${msg.msg}`}
                is_visible={false}
                avatar_url={msg.avatarUrl}
                user_nickname={msg.userNickname}
                user_id={msg.id}
                user_email={msg.email}
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

      <div className="row-span-1 border-t border-black/[0.07] flex items-center px-1">
        <ChatInput current_host_id={current_host_id} />
        <button
          className="group relative flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-sky-50 hover:bg-sky-100 shadow-sm transition-colors"
          onClick={() => set_is_pm_modal_open(true)}
          onMouseEnter={triggerDonationBurst}
        >
          <span className="text-lg leading-none select-none grayscale group-hover:grayscale-0 transition-[filter] duration-300">
            💰
          </span>
          <AnimatePresence>
            {show_donation_burst && (
              <React.Fragment key={donation_burst}>
                {/* 돈주머니(중앙)에서 동전+지폐가 뾰로롱 한 번 터졌다 사라지는 빵파레 느낌 — hover 유지해도 재생 안 하고 딱 한 번만 */}
                {[
                  { key: "coin-1", type: "🪙", x: -20, y: -10, rotate: -30, delay: 0 },
                  { key: "bill-1", type: "💵", x: -8, y: -28, rotate: -12, delay: 0.05 },
                  { key: "bill-2", type: "💵", x: 8, y: -28, rotate: 12, delay: 0.1 },
                  { key: "coin-2", type: "🪙", x: 20, y: -10, rotate: 30, delay: 0.15 },
                ].map((p) => (
                  <motion.span
                    key={p.key}
                    className="absolute top-1/2 left-1/2 -ml-2 -mt-2 text-xs pointer-events-none select-none"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: 1, rotate: p.rotate }}
                    transition={{
                      duration: 0.65,
                      times: [0, 0.2, 0.75, 1],
                      ease: "easeOut",
                      delay: p.delay,
                    }}
                  >
                    {p.type}
                  </motion.span>
                ))}
              </React.Fragment>
            )}
          </AnimatePresence>
        </button>

        {id_target &&
          createPortal(
            <PaymentPage
              set_is_pm_modal_open={set_is_pm_modal_open}
              is_pm_modal_open={is_pm_modal_open}
              current_host_nickname={current_host_nickname}
              current_host_id={current_host_id}
            />,
            id_target,
          )}
      </div>
    </div>
  );
};
export default ChatRoom;
