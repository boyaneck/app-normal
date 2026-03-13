import React, { useEffect } from "react";
import { useConnectionState, useRoomContext } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
const LiveStatusChecker = () => {
  const state = useConnectionState();
  const room = useRoomContext();
  useEffect(() => {
    if (state === ConnectionState.Reconnecting) {
      // 1. 재연결 시도 중일 때 로직
      console.log("네트워크가 불안정하여 자동으로 재연결을 시도합니다...");
    }

    if (state === ConnectionState.Disconnected) {
      // 2. 완전히 끊겼을 때 로직 (수동 복구가 필요할 때)
      alert(
        "연결이 완전히 끊겼습니다. 페이지를 새로고침하거나 다시 입장해주세요.",
      );
    }
  }, [state]);
  return <div>LiveStatusChecker</div>;
};

export default LiveStatusChecker;
