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
  reconnectAttempt:number,
  sendMsg: (msg: MsgInfo) => void | null;



  handleError: ((error: { type: string; msg: string }) => void) | null;

  connectSocket: () => void;
  disconnect_socket: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connectionState:"disconnected",
  reconnectionInfo:  
  connectSocket: () => {
    if (get().socket?.connected) return
    
      const prev = get().socket;
    if (prev) {
      prev.removeAllListeners();
      prev.close();
    }
      const socket = io("http://localhost:3001/room", {
        transports: ["websocket"],
      });

       socket.on("connect", () => {
      console.log("[Socket] 연결 성공:", socket.id);
      set({ ConnectionState: "connected", reconnectAttempt: 0 });
    });
 



  },
