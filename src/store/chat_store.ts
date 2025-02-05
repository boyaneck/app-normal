import { create } from "zustand";

const useChatRoomInfo = create<chat_room_info_state>((set) => ({
  chat_room_info: [],
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => {
    set({ chat_room_info: roomInfo });
    console.log("채팅목록정보스토어", roomInfo);
  },
}));

export { useChatRoomInfo };

const useCurrentChatRoomStore = create<currentChatRoomState>((set) => ({
  currentChatRoomNumber: "",
  setCurrentChatRoomNumber: (roomNumber: string) => {
    console.log("쓰음", roomNumber), set({ currentChatRoomNumber: roomNumber });
  },
}));

const useChatRoomOpenStore = create<chat_room_state>((set) => ({
  isChatRoomOpened: false,
  setIsChatRoomOpened: (isOpen: boolean) => set({ isChatRoomOpened: isOpen }),
}));
