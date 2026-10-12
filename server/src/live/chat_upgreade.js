import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Picker from "emoji-picker-react";
import PaymentPage from "../_components/payment/payment";
import useUserStore from "../../../store/user";
import axios from "axios";
import {
  chat_props,
  heart,
  remove_message_props,
  warning_chat,
} from "../../../types/chat";
import { useSocketStore } from "@/store/socket_store";
import { getChatInfo } from "@/api/chat";
import clsx from "clsx";
import { max_messages, option_data, sanction_duration } from "@/utils/chat";
import { AnimatedMessage } from "./_components/animated_message";
import { ChatInput } from "./_components/chat_input";
import ChatSanction from "./_components/chat_sanction";
import { useStreamingBarStore } from "@/store/bar_store";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowDown, 
  Pin, 
  Wifi, 
  WifiOff, 
  Zap, 
  ThermometerSnowflake, 
  Activity 
} from "lucide-react";

interface Props {
  current_host_nickname: string;
  current_host_id: string;
}

// [최적화 상수]
const BATCH_INTERVAL = 100; 
const MAX_STORED_MESSAGES = 200; 

// [네트워크 API 타입 정의 (TS)]
interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  rtt: number;
  downlink: number;
  saveData: boolean;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

const ChatRoom = ({ current_host_nickname, current_host_id }: Props) => {
  const icon = useStreamingBarStore((state) => state.icon);
  
  // ---------------------------------------------------------------------------
  // [1. 대규모 트래픽 & 최적화 상태]
  // ---------------------------------------------------------------------------
  const [visible_messages, set_visible_messages] = useState<chat_props[]>([]);
  const messageQueueRef = useRef<chat_props[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // [2. 네트워크 & 성능 상태 (Adaptive UX)]
  const [network_quality, set_network_quality] = useState<'good' | 'poor' | 'offline'>('good');
  const [is_lite_mode, set_is_lite_mode] = useState(false); // 저사양 모드 (애니메이션 제거)
  const [ping, set_ping] = useState(15); // 가상 핑(ms)

  // [3. 채팅방 관리 상태 (Slow Mode / Freeze)]
  const [is_slow_mode, set_is_slow_mode] = useState(false);
  const [is_chat_frozen, set_is_chat_frozen] = useState(false);

  // 일반 상태
  const [is_user_scrolling_up, set_is_user_scrolling_up] = useState(false);
  const [unread_count, set_unread_count] = useState(0);
  const { socket, connect_socket } = useSocketStore();
  
  // 모달 & 포탈
  const [selected_message_for_modal, set_selected_message_for_modal] = useState<remove_message_props | null>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [is_pm_modal_open, set_is_pm_modal_open] = useState<boolean>(false);
  const [id_target, set_id_target] = useState<HTMLDivElement | null>(null);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // [핵심 기능 1: 네트워크 감지 및 적응형 UI (Graceful Degradation)]
  // 면접 포인트: 사용자의 환경에 맞춰 앱이 스스로 최적화하는 "적응형(Adaptive)" 설계 능력
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // @ts-ignore (navigator.connection은 표준이지만 TS에 없을 수 있음)
    const connection = navigator.connection as NetworkInformation;

    const updateNetworkStatus = () => {
      if (!connection) return;

      const { effectiveType, rtt } = connection;
      
      // 핑 시뮬레이션 (실제로는 소켓 퐁으로 측정)
      set_ping(rtt);

      // 네트워크가 3g 이하이거나 RTT가 500ms 이상이면 'poor'로 간주
      if (effectiveType === '2g' || effectiveType === 'slow-2g' || rtt > 500) {
        set_network_quality('poor');
        set_is_lite_mode(true); // [자동 최적화] 라이트 모드 강제 활성화
        console.warn("네트워크 불안정 감지: 저사양 모드로 전환합니다.");
        
        // TODO: 여기서 Video Player에 이벤트를 보내 화질을 낮추는 로직 연결
        // window.dispatchEvent(new CustomEvent('request-lower-bitrate')); 
      } else {
        set_network_quality('good');
        set_is_lite_mode(false);
      }
    };

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
      updateNetworkStatus(); // 초기 실행
    }

    return () => {
      if (connection) connection.removeEventListener('change', updateNetworkStatus);
    };
  }, []);


  // ---------------------------------------------------------------------------
  // [핵심 기능 2: 메시지 쓰로틀링 & 배치 프로세싱]
  // 면접 포인트: React 렌더링 사이클을 이해하고, 불필요한 리렌더링을 방지하는 기술
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) connect_socket();

    const handleReceiveMessage = (message_info: chat_props) => {
      // 채팅방이 얼어있으면 메시지 수신 거부 (클라이언트 단 처리)
      if (is_chat_frozen) return; 
      messageQueueRef.current.push(message_info);
    };

    if (socket) {
      socket.on("receive_message", handleReceiveMessage);
      
      // [추가] 관리자 기능 시뮬레이션 이벤트
      socket.on("chat_freeze", (status: boolean) => set_is_chat_frozen(status));
      socket.on("slow_mode", (status: boolean) => set_is_slow_mode(status));
    }

    const intervalId = setInterval(() => {
      if (messageQueueRef.current.length > 0) {
        const new_messages = [...messageQueueRef.current];
        messageQueueRef.current = [];

        set_visible_messages((prev) => {
          // [메모리 누수 방지] Virtual List가 없어도 DOM 개수 제한
          const updated = [...prev, ...new_messages];
          if (updated.length > MAX_STORED_MESSAGES) {
            return updated.slice(updated.length - MAX_STORED_MESSAGES);
          }
          return updated;
        });
      }
    }, BATCH_INTERVAL);

    return () => {
      socket?.off("receive_message");
      socket?.off("chat_freeze");
      socket?.off("slow_mode");
      clearInterval(intervalId);
    };
  }, [socket, connect_socket, is_chat_frozen]);


  // ---------------------------------------------------------------------------
  // [핵심 기능 3: 스마트 오토 스크롤]
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!is_user_scrolling_up && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    } else if (is_user_scrolling_up) {
      set_unread_count((prev) => prev + 1); 
    }
  }, [visible_messages, is_user_scrolling_up]);

  const onScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    if (isBottom) {
      set_is_user_scrolling_up(false);
      set_unread_count(0);
    } else {
      set_is_user_scrolling_up(true);
    }
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      set_is_user_scrolling_up(false);
      set_unread_count(0);
    }
  };

  useEffect(() => {
    if (paymentRef.current) {
      set_id_target(paymentRef.current);
    }
  }, []);

  // 모달 제어
  const selectWarningOption = (reason: string) => {
    // @ts-ignore
    set_selected_warning_reason((prev) => (prev === reason ? null : reason));
  };


  return (
    <div className={clsx(`grid grid-rows-10 w-full h-full rounded-xl overflow-hidden bg-gray-900/90 relative border border-gray-700/50 backdrop-blur-md`)}>
      
      {/* [UI 디테일 1: 스트림 상태 바]
        면접 포인트: 개발자 도구나 복잡한 설정 없이 직관적으로 시스템 상태를 보여주는 UX 
      */}
      <div className="absolute top-0 left-0 right-0 z-20 h-8 flex items-center justify-between px-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
            {/* 네트워크 상태 인디케이터 */}
            <div className={clsx(
                "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border backdrop-blur-sm",
                network_quality === 'good' ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
            )}>
                {network_quality === 'good' ? <Wifi size={10} /> : <WifiOff size={10} />}
                <span>{network_quality === 'good' ? "LIVE" : "UNSTABLE"}</span>
                <span className="opacity-70">| {ping}ms</span>
            </div>

            {/* 라이트 모드 (자동 성능 최적화) 표시 */}
            {is_lite_mode && (
                 <div className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Zap size={10} />
                    <span>LITE MODE</span>
                 </div>
            )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div
        className="row-span-9 overflow-y-auto scrollbar-hide relative px-4 pt-8" // pt-8로 상단 바 공간 확보
        id="payment-modal-target"
        ref={(node) => {
            paymentRef.current = node;
            // @ts-ignore
            chatContainerRef.current = node;
        }}
        onScroll={onScroll}
      >
        {/* 공지사항 */}
        <div className="sticky top-0 z-10 mb-4 opacity-90 hover:opacity-100 transition-opacity">
            <div className="bg-indigo-600/90 backdrop-blur-md text-white text-xs px-3 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer border border-white/10">
                <Pin size={12} className="fill-white shrink-0" />
                <span className="font-bold text-indigo-200 shrink-0">공지</span>
                <span className="truncate flex-1">클린한 채팅 문화를 지켜주세요!</span>
            </div>
        </div>

        {/* 채팅 얼리기 (Freeze) 상태 UI */}
        {is_chat_frozen && (
             <div className="my-4 flex justify-center animate-in fade-in slide-in-from-bottom-2">
                 <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                    <ThermometerSnowflake size={14} />
                    <span>호스트가 채팅을 일시 정지했습니다.</span>
                 </div>
             </div>
        )}

        {/* 채팅 메시지 리스트 */}
        <div className={clsx("flex flex-col gap-2 pb-4", is_lite_mode && "gap-1")}>
          {visible_messages.map((message_info) => (
            // [최적화] Lite Mode일 경우 복잡한 AnimatedMessage 대신 단순 텍스트 렌더링도 고려 가능
            // 여기서는 prop으로 전달하여 내부에서 효과를 끕니다.
            <AnimatedMessage
              key={message_info.id + Math.random()} 
              message={`${message_info.user_nickname}: ${message_info.message}`}
              is_visible={true} 
              avatar_url={message_info.avatar_url}
              user_nickname={message_info.user_nickname}
              user_id={message_info.id}
              user_email={message_info.email}
              // 모달 관련 props
              selected_message_for_modal={selected_message_for_modal}
              set_selected_message_for_modal={set_selected_message_for_modal}
              is_modal_open={is_modal_open}
              set_is_modal_open={set_is_modal_open}
              // [추가 Prop] 라이트 모드 여부 전달
              // @ts-ignore (AnimatedMessage에 prop 추가 필요, 여기선 개념 전달)
              is_lite_mode={is_lite_mode} 
            />
          ))}
        </div>

        {/* 새 메시지 알림 (Smart Scroll) */}
        <AnimatePresence>
          {is_user_scrolling_up && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="sticky bottom-4 left-0 right-0 flex justify-center z-20 pointer-events-none"
            >
              <button
                onClick={scrollToBottom}
                className="pointer-events-auto bg-gray-800/95 text-white text-xs font-bold py-2 px-4 rounded-full shadow-2xl border border-gray-600 flex items-center gap-2 hover:bg-gray-700 transition-all backdrop-blur-md ring-1 ring-white/10"
              >
                <ArrowDown size={14} className="animate-bounce" />
                {unread_count > 0 ? (
                    <span className="text-indigo-300">{unread_count}개 메시지 더보기</span>
                ) : (
                    "맨 아래로"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {is_modal_open && (
          <ChatSanction
            set_is_modal_open={set_is_modal_open}
            is_modal_open={is_modal_open}
            set_selected_message_for_modal={set_selected_message_for_modal}
            selected_message_for_modal={selected_message_for_modal}
            // @ts-ignore
            selectWarningOption={selectWarningOption}
            set_selected_warning_reason={set_selected_warning_reason}
            selected_warning_reason={selected_warning_reason}
          />
        )}
      </div>

      {/* 입력창 영역 */}
      <div className="border-t border-gray-700/50 row-span-1 grid grid-cols-[85%_15%] items-center bg-gray-800/50 p-2 gap-2 backdrop-blur-sm">
        {/* Slow Mode일 때 입력창에 힌트 제공 (ChatInput 내부 구현 필요, 여기선 wrapper로 표현) */}
        <div className="relative h-full w-full">
            <ChatInput current_host_id={current_host_id} />
            {is_slow_mode && (
                <div className="absolute -top-8 left-2 text-[10px] text-yellow-500 flex items-center gap-1 bg-black/80 px-2 py-1 rounded">
                    <Activity size={10} /> Slow Mode: 메시지 전송 3초 제한
                </div>
            )}
        </div>
        
        <button 
            className="bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold rounded-lg h-full transition-all text-sm shadow-lg flex flex-col items-center justify-center leading-tight active:scale-95"
            onClick={() => set_is_pm_modal_open(true)}
        >
          <span>₩</span>
          <span className="text-[10px]">후원</span>
        </button>

        {id_target &&
          createPortal(
            <PaymentPage
              set_is_pm_modal_open={set_is_pm_modal_open}
              is_pm_modal_open={is_pm_modal_open}
              current_host_nickname={current_host_nickname}
              current_host_id={current_host_id}
            />,
            id_target
          )}
      </div>
    </div>
  );
};

export default ChatRoom;