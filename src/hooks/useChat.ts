import { useSocketStore } from "@/store/socket-store";
import { useEffect, useState, useCallback, useRef } from "react";

interface MsgInfo {
  msgId?: string;
  userId?: string;
  userNickname: string;
  avatarUrl?: string;
  email?: string;
  msg: string;
  hostId: string;
  chatRoomNum: string;
  date?: string;
  serverTimestamp?: number;
}

interface UseChatParams {
  hostId: string;
  userId: string;
  userNickname: string;
  avatarUrl?: string;
  email?: string;
  isHost?: boolean;
}

const useChat = ({
  hostId,
  userId,
  userNickname,
  avatarUrl,
  email,
  isHost = false,
}: UseChatParams) => {
  const [messages, setMessages] = useState<MsgInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  const {
    socket,
    connectionState,
    reconnectAttempt,
    connectSocket,
    disconnectSocket,
    sendMsg,
    setOnMsg,
    setOnError,
    setOnReconnect,
  } = useSocketStore();

  // room 입장 (연결 시 + 재연결 시 둘 다 사용)
  const joinRoom = useCallback(() => {
    const currentSocket = useSocketStore.getState().socket;
    if (currentSocket?.connected && hostId) {
      currentSocket.emit("join_room", {
        roomId: hostId,
        userId,
        userNickname,
        isHost,
      });
    }
  }, [hostId, userId, userNickname, isHost]);

  // 소켓 연결 + 콜백 등록
  useEffect(() => {
    connectSocket();

    // 메시지 오면 → messages 배열에 추가
    setOnMsg((msg: MsgInfo) => {
      setMessages((prev) => {
        // 중복 방지
        if (msg.msgId && prev.some((m) => m.msgId === msg.msgId)) {
          return prev;
        }
        // 최대 200개 유지
        const updated = [...prev, msg];
        return updated.length > 200 ? updated.slice(-200) : updated;
      });
    });

    // 에러 오면 → 3초 토스트
    setOnError(({ msg }) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    // 재연결 성공하면 → room 재입장
    setOnReconnect(() => {
      joinRoom();
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  // 연결 성공 시 방 입장
  useEffect(() => {
    if (connectionState === "connected") {
      joinRoom();
    }
  }, [connectionState, joinRoom]);

  // 메시지 전송
  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return false;

      return sendMsg({
        userId,
        userNickname,
        avatarUrl,
        email,
        msg: text,
        hostId,
        chatRoomNum: hostId,
        date: new Date().toISOString(),
      });
    },
    [userId, userNickname, avatarUrl, email, hostId, sendMsg],
  );

  // 자동 스크롤
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  }, []);

  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  // 반환
  return {
    messages,
    connectionState,
    reconnectAttempt,
    error,
    autoScroll,
    send,
    chatRef,
    handleScroll,
    scrollToBottom: () => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        setAutoScroll(true);
      }
    },
  };
};

export default useChat;
