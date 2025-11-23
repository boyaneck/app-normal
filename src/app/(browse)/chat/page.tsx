import React from "react";
import ChatRoom from "./chat_room";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  current_host_nickname: string;
  current_host_id: string;
}

const ChatPage = ({ current_host_nickname, current_host_id }: Props) => {
  const query_client = new QueryClient();
  console.log("챗페이지에서의 콘솔", current_host_id);

  return (
    <QueryClientProvider client={query_client}>
      <ChatRoom
        current_host_nickname={current_host_nickname}
        current_host_id={current_host_id}
      />
    </QueryClientProvider>
  );
  //Ingress 와 Livekit 공부ㅎ
};

export default ChatPage;
