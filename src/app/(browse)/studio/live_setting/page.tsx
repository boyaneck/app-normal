import React from "react";
import LiveScreen from "./live_screen";
import { LiveKitRoom } from "@livekit/components-react";
import useUserStore from "@/store/user";
import { useViewerToken } from "@/hooks/useViewerToken";
import ThumbUpload from "./thumb_upload";
import TitleAndDescription from "./title_and_desc";
import LiveSetting from "../live_setting";
import LiveSettingButton from "./live_setting_button";
const LiveSettingPage = () => {
  const { user } = useUserStore((state) => state);
  const { token, name, identity } = useViewerToken(user?.user_id);
  return (
    <div className="">
      {/* connect는 state 로 관리하여, 연결 유무 버튼을 통해 연결하기, */}
      {/* <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        connect={true}
        audio={false}
      >
        <LiveScreen />
      </LiveKitRoom> */}
      <TitleAndDescription />
      <ThumbUpload />
      <LiveSettingButton />
    </div>
  );
};

export default LiveSettingPage;
