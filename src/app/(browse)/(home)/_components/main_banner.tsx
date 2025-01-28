import { createIngress } from "@/api";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import React from "react";
import Video from "../../live/_components/video";
import { useViewrToken } from "@/hooks/useViewerToken";

const Main_banner = () => {
  const { user } = useUserStore((state) => state);

  // const { token } = useViewrToken(user?.user_id, user?.user_nickname, "");
  const onyva = () => {
    try {
      createIngress(1, user);
      alert("s");
    } catch (error) {
      alert("에러가발생했어요!");
    }
  };

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
      <div>
        <button
          className="hover cursor-pointer border border-red-300"
          onClick={onyva}
        >
          dd
        </button>
      </div>
    </div>
  );
};

export default Main_banner;
