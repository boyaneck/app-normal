import { create } from "zustand";
import { io, Socket } from "socket.io-client";

// livekit의 ConnectionState와 이름이 겹치니까 여기서는 별도 타입으로 정의
type SocketConnectionState =
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "failed";

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

interface SocketState {
  socket: Socket | null;
  connectionState: SocketConnectionState;
  reconnectAttempt: number;

  connectSocket: () => void;
  disconnectSocket: () => void;
  sendMsg: (msgInfo: MsgInfo) => boolean;

  // 콜백 - useChat에서 등록
  onMsg: ((msg: MsgInfo) => void) | null;
  onError: ((error: { type: string; msg: string }) => void) | null;
  onReconnect: (() => void) | null;

  setOnMsg: (handler: (msg: MsgInfo) => void) => void;
  setOnError: (handler: (error: { type: string; msg: string }) => void) => void;
  setOnReconnect: (handler: () => void) => void;
}

let lastMsgTimestamp = 0;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connectionState: "disconnected",
  reconnectAttempt: 0,
  onMsg: null,
  onError: null,
  onReconnect: null,

  setOnMsg: (handler) => set({ onMsg: handler }),
  setOnError: (handler) => set({ onError: handler }),
  setOnReconnect: (handler) => set({ onReconnect: handler }),

  // ----------------------------------------------------------
  // 연결
  // ----------------------------------------------------------
  connectSocket: () => {
    if (get().socket?.connected) return;

    // 이전 소켓 정리 (중복 연결 방지)
    const prev = get().socket;
    if (prev) {
      prev.removeAllListeners();
      prev.close();
    }

    const socket = io("http://localhost:3001/room", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.3,
    });

    // 소켓 인스턴스 저장
    set({ socket, connectionState: "disconnected" });

    // --- 연결 성공 ---
    socket.on("connect", () => {
      console.log("[Socket] 연결 성공:", socket.id);
      set({ connectionState: "connected", reconnectAttempt: 0 });
    });

    // --- 메시지 수신 ---
    socket.on("receive_msg", (msg: MsgInfo) => {
      // 재연결 시 복구 기준점 업데이트
      if (msg.serverTimestamp) {
        lastMsgTimestamp = msg.serverTimestamp;
      }

      // useChat에서 등록한 콜백 호출
      const { onMsg } = get();
      if (onMsg) onMsg(msg);
    });

    // --- 놓친 메시지 복구 ---
    // 재연결 후 join_room 하면 서버가 Redis에서 최근 메시지를 보내줌
    socket.on("msg_history", ({ msgList }: { msgList: MsgInfo[] }) => {
      // 이미 받은 메시지 필터링 (lastMsgTimestamp 이후 것만)
      const newMsgList = msgList.filter(
        (msg) => (msg.serverTimestamp || 0) > lastMsgTimestamp,
      );

      const { onMsg } = get();
      if (onMsg && newMsgList.length > 0) {
        newMsgList.forEach((msg) => onMsg(msg));

        // 마지막 타임스탬프 갱신
        const latest = newMsgList[newMsgList.length - 1];
        if (latest.serverTimestamp) {
          lastMsgTimestamp = latest.serverTimestamp;
        }
      }
    });

    // --- 서버에서 보낸 에러 ---
    socket.on(
      "msg_rejected",
      ({ reason, msg }: { reason: string; msg: string }) => {
        const { onError } = get();
        if (onError) onError({ type: reason, msg });
      },
    );

    socket.on("error_event", ({ msg }: { msg: string }) => {
      const { onError } = get();
      if (onError) onError({ type: "serverError", msg });
    });

    // ----------------------------------------------------------
    // 재연결 관련 (socket.io = 매니저 이벤트)
    // ----------------------------------------------------------

    socket.io.on("reconnect_attempt", (attempt: number) => {
      set({ connectionState: "reconnecting", reconnectAttempt: attempt });
    });

    // 재연결 성공 → useChat에서 등록한 콜백 호출 (room 재입장)
    socket.io.on("reconnect", () => {
      set({ connectionState: "connected", reconnectAttempt: 0 });

      const { onReconnect } = get();
      if (onReconnect) onReconnect();
    });

    // 재연결 실패 (10번 다 실패)
    socket.io.on("reconnect_failed", () => {
      set({ connectionState: "failed" });
      const { onError } = get();
      if (onError) {
        onError({
          type: "reconnectFailed",
          msg: "서버와의 연결이 끊겼습니다. 페이지를 새로고침해주세요.",
        });
      }
    });

    socket.on("disconnect", (reason: string) => {
      console.log("[Socket] 연결 끊김:", reason);
      // 내장 재연결이 자동으로 시작됨
    });
  },

  // ----------------------------------------------------------
  // 메시지 전송
  // ----------------------------------------------------------
  sendMsg: (msgInfo) => {
    const { socket, connectionState, onError } = get();

    // 연결 안 돼있으면 즉시 피드백
    if (!socket || !socket.connected) {
      if (onError) {
        const errorMsg =
          connectionState === "reconnecting"
            ? "재연결 중입니다. 잠시 후 다시 시도해주세요."
            : "연결이 끊겼습니다.";
        onError({ type: "notConnected", msg: errorMsg });
      }
      return false;
    }

    socket.emit("send_msg", { msgInfo });
    return true;
  },

  // ----------------------------------------------------------
  // 연결 해제
  // ----------------------------------------------------------
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    set({
      socket: null,
      connectionState: "disconnected",
      reconnectAttempt: 0,
    });
  },
}));
