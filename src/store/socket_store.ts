import { create } from "zustand";
import { io, Socket } from "socket.io-client";
interface socket_state_props {
  socket: Socket | null;
  // setSocket: (socket:Socket) => void
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

      socket.on("connected", () => {});

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
