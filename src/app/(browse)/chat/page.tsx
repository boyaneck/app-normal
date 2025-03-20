import React from "react";
import ChatRoom from "./chat_room";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  current_host_nickname: string;
}

const ChatPage = ({ current_host_nickname }: Props) => {
  const query_client = new QueryClient();

  return (
    <>
      <QueryClientProvider client={query_client}>
        <ChatRoom current_host_nickname={current_host_nickname} />
      </QueryClientProvider>
    </>
  );
  //Ingress 와 Livekit 공부ㅎ
};

export default ChatPage;
