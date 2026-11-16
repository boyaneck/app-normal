"use client";

import { createPreviewToken } from "@/api/token";
import { LiveKitRoom } from "@livekit/components-react";
import React, { useEffect, useState } from "react";
import LiveListVideo from "./live_list_video";

/**
 * 홈 목록 카드 hover 미리보기
 * - hover한 카드에서만 마운트되고, 마우스가 떠나면 언마운트되면서 LiveKit 연결도 끊긴다.
 * - 카드마다 자기 hostId로 토큰을 받으므로, 이전에 hover한 방의 토큰으로 잘못 접속하는 일이 없다.
 * - video/audio=false: 시청자는 송출하지 않는다 (예전엔 video=true라 카메라 권한을 요청했다)
 * - RoomAudioRenderer를 넣지 않아서 소리는 나지 않는다.
 */
const LivePreview = ({ hostId }: { hostId: string }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createPreviewToken(hostId)
      .then((t) => {
        if (!cancelled) setToken(t);
      })
      .catch((error) => console.error("미리보기 토큰 생성 실패:", error));
    return () => {
      cancelled = true;
    };
  }, [hostId]);

  if (!token) return null;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      connect
      video={false}
      audio={false}
      options={{ adaptiveStream: true }}
      className="relative h-full w-full"
    >
      <LiveListVideo />
    </LiveKitRoom>
  );
};

export default LivePreview;
