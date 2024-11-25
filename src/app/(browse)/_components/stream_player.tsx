"use client";
import Video from "@/components/stream_player/video";
import { useViewrToken } from "@/hooks/useViewerToken";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import React from "react";

interface StreamPlayerProps {
  user: string;
  stream: string;
  is_following: string;
}

const Stream_Player = ({ user, stream, is_following }: StreamPlayerProps) => {
  const { user: current_user } = useUserStore((state) => state);
  const { token, name, identity } = useViewrToken(current_user?.user_email!);

  console.log("뿡빳뿡커리 유저 토큰", token, name, identity);
  if (!token || !name || identity) {
    return <div>Cannot watch the stream</div>;
  }

  return (
    <div>
      Allowed to watch stream
      <LiveKitRoom
        token={token}
        server_url={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      />
      부모 클래스
      <Video host_name="" host_identity="" />
    </div>
  );
};

export default Stream_Player;
