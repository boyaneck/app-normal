import React from "react";
import ChatRoom from "./chat_room";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const ChatPage = () => {
  const query_client = new QueryClient();

  return (
    <>
      <QueryClientProvider client={query_client}>
        <ChatRoom />
      </QueryClientProvider>
    </>
  );
  //Ingress 와 Livekit 공부ㅎ
};

export default ChatPage;
