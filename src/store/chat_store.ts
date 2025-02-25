import { create } from "zustand";

const useChatRoomInfo = create<chat_room_info_state>((set) => ({
  chat_room_info: [],
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => {
    set({ chat_room_info: roomInfo });
    console.log("채팅목록정보스토어", roomInfo);
  },
}));

export { useChatRoomInfo };

const useCurrentChatRoomStore = create<current_chatroom_state>((set) => ({
  current_chat_roomnumber: "",
  set_current_chat_roomnumber: (roomNumber: string) => {
    console.log("쓰음", roomNumber),
      set({ current_chat_roomnumber: roomNumber });
  },
}));

const useChatRoomOpenStore = create<chat_room_state>((set) => ({
  is_chat_room_opened: false,
  set_is_chat_room_opened: (isOpen: boolean) =>
    set({ is_chat_room_opened: isOpen }),
}));
