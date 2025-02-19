declare interface chat_room_info {}

declare interface props_message_info {
  user_nickname: string | undefined;
  avatar_url: string | undefined;
  message: string | null;
  date: string;
  current_chat_room_number: string;
}
declare interface chat_room_info {
  id: string;
  user_nickname: string;
  chat_room_number: string;
}
declare interface chat_room_info_state {
  chat_room_info: chat_room_info[] | undefined;
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => void;
}

declare interface chat_room_info_state {
  chat_room_info: chat_room_info[] | undefined;
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => void;
}

declare interface chat_props {
  user_nickname: string[] | undefined;
  avatar_url: string | null | undefined;
  message: string | null;
  created_at: string;
  chat_room_number: string;
}

declare interface chat_room_state {
  is_chat_room_opened: boolean;
  set_is_chat_room_opened: (isOpen: boolean) => void;
}

declare interface current_chatroom_state {
  current_chat_roomnumber: string;
  set_current_chat_roomnumber: (roomNumber: string) => void;
}
