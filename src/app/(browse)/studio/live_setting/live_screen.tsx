import { useViewerToken } from "@/hooks/useViewerToken";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import { Video } from "lucide-react";
import React from "react";

const LiveScreen = () => {
  const { user } = useUserStore((state) => state);
  const { token, name, identity } = useViewerToken(user?.user_id);
  return (
    <div className=" ">
      스트리밍 화면
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        connect={true}
        audio={false}
      >
        <Video className="w-[30px] h-[30px] object-contain" />
      </LiveKitRoom>
    </div>
  );
};

export default LiveScreen;
