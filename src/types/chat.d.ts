export interface chat_room_info {}

export interface message_info_props {
  user_nickname: string | undefined;
  avatar_url: string | undefined;
  message: string | null;
  date: string;
  current_chat_room_number: string;
}
export interface chat_room_info {
  id: string;
  user_nickname: string;
  chat_room_number: string;
  avatar_url: string;
  message: string;
  date: string;
  id: string;
}
export interface chat_room_info_state {
  chat_room_info: chat_room_info[] | undefined;
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => void;
}

export interface chat_room_info_state {
  chat_room_info: chat_room_info[] | undefined;
  set_chat_room_info: (roomInfo: chat_room_info[] | undefined) => void;
}

export interface chat_props {
  user_nickname: string[] | undefined;
  avatar_url: string | undefined;
  message: string | null;
  created_at: string;
  chat_room_number: string;
  id: string;
  email: string;
}

export interface chat_room_state {
  is_chat_room_opened: boolean;
  set_is_chat_room_opened: (isOpen: boolean) => void;
}

export interface current_chatroom_state {
  current_chat_roomnumber: string;
  set_current_chat_roomnumber: (roomNumber: string) => void;
}

export interface animated_heart {
  onAnimationEnd: (heart: heart) => void;
  id: number;
}
export interface heart {
  id: number;
}
export interface remove_message_props {
  message: string;
  is_visible: boolean;
  avatar_url: string | undefined;
  user_id: string;
  user_nickname: string[] | undefined;
  user_email: string;
}
export interface id_props {
  id: number;
}

export interface host_nickname_props {
  host_nickname?: string;
}

export interface handling_chat {
  action: "kick_out" | "ban";
  target_identity: string;
  room_name: string;
  duration_minutes: number;
  reason: string;
}

export interface warning_chat {
  user_id: string;
  message: string;
  user_nickname: string[] | undefined;
  user_email: string;
  reason: string;
  // duration_type:''
  // duration_value?:number
}
