import { useSocketStore } from "@/store/socket_store";
import { connect } from "http2";
import { useEffect, useState } from "react";

const useCreateChat = () => {
  const [is_chat_opened, set_is_chat_opened] = useState(false);

  const { socket, disconnect_socket, connect_socket } = useSocketStore();

  const createChatRoom = () => {
    set_is_chat_opened(true);
  };

  useEffect(() => {
    connect_socket();
  }, []);

  return { createChatRoom };
};

export default useCreateChat;
