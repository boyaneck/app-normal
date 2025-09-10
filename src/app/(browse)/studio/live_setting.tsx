import { LiveKitRoom } from "@livekit/components-react";
import { Video } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const LiveSetting = () => {
  const [viewerToken, setViewerToken] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // 1. WebRTC로 내 카메라 영상을 직접 가져옵니다.
    const testVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    // 2. 시청자용 토큰을 가져옵니다.
    const getToken = async () => {
      // setViewerToken(awasetViewerTokenken());
    };

    testVideo();
    getToken();
  }, []);

  if (!viewerToken) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4">
      {/* <div className="col-span-1">
        <h3 className="text-center">내 카메라 미리보기 (지연 없음)</h3>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
      </div> */}

      {/* ✅ 오른쪽: 하나의 LiveKitRoom으로 시청자 관점 영상 구독 */}
      <div className="col-span-1">
        <h3 className="text-center">실제 시청자 화면 (지연 발생)</h3>
        <LiveKitRoom
          token={viewerToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          connect={true}
          audio={false}
        >
          <Video className="w-full h-full object-contain" />
        </LiveKitRoom>
      </div>
    </div>
  );
};

export default LiveSetting;
