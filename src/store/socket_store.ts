import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { ConnectionState } from "@livekit/components-react";

type ConnectionState = "connected" | "disconnected" | "reconnecting" | "failed";

interface MsgInfo {
  msgId: string;
  userId: string;
  userNickname: string;
  msg: string;
  hostId: string;
  chatRoomNum: string;
}

interface ReconnectInfo {
  attempt: number;
  max: number;
  nextTryMs: number;
}

interface SocketState {
  socket: Socket | null;
  connectionState: ConnectionState;
  reconnectionInfo: ReconnectInfo;
  sendMsg: (msg: MsgInfo) => void | null;

  handleError: ((error: { type: string; msg: string }) => void) | null;

  connect_socket: () => void;
  disconnect_socket: () => void;
}

export const useSocketStore = create<socket_state_props>((set, get) => ({
  socket: null,
  connect_socket: () => {
    if (!get().socket) {
      const socket = io("http://localhost:3001/room", {
        transports: ["websocket"],
      });
      set({ socket });

      socket.on("connected", () => {
        console.log("연결이 성공했습니다!");
      });

      socket.on("disconnected", () => {
        set({ socket: null });
      });
    }
  },
  disconnect_socket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
