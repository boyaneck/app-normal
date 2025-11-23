import React from "react";
import LiveScreen from "./live_screen";
import MetadataSetting from "./metadata_setting";
import NetworkSetting from "./network_setting";
import { LiveKitRoom } from "@livekit/components-react";
import useUserStore from "@/store/user";
import { useViewerToken } from "@/hooks/useViewerToken";
const LiveSettingPage = () => {
  const { user } = useUserStore((state) => state);
  const { token, name, identity } = useViewerToken(user?.user_id);
  return (
    <div className="grid grid-row-3 gap-2 bg-gray-500">
      {/* connect는 state 로 관리하여, 연결 유무 버튼을 통해 연결하기, */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        connect={true}
        audio={false}
      >
        <LiveScreen />
        <MetadataSetting />
        <NetworkSetting />
      </LiveKitRoom>
    </div>
  );
};

export default LiveSettingPage;
