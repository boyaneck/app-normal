import { createIngress, getLiveUser } from "@/api";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import React, { useState } from "react";
import Video from "../../live/_components/video";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useQuery } from "@tanstack/react-query";

const Main_banner = () => {
  const [live_user, set_live_user] = useState<User[]>([]);
  const { user } = useUserStore((state) => state);
  const {
    data: LiveUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  const { token } = useViewrToken("Guest", "Guest", "");

  return (
    <div
      className="h-[500px] border border-green-500"
      onMouseOver={() => {
        setTimeout(() => {}, 1000);
      }}
    >
      Main_bannersss
      {/* {token && (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          // room={room}
          className="border border-purple-500 grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3
          xl:grid-cols-3 2xl:grid-cols-6 h-full"
        >
          <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar">
            <Video
              host_name={current_host_nickname}
              host_identity={current_host_id}
              token={token}
            />
          </div>
        </LiveKitRoom>
      )} */}
    </div>
  );
};

export default Main_banner;
