"use client";
import { useViewerToken } from "@/hooks/useViewerToken";
import { LiveKitRoom } from "@livekit/components-react";
import Video from "@/app/(browse)/live/_components/video";
import { useRef, useState } from "react";
import AICopilot from "./_components/AI-copilot";
import AIAnswer from "./_components/AI-answer";

const StudioLivePage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { token } = useViewerToken(id);

  const videoRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleFullScreen = () => {
    if (!isFullScreen) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-[75vh] text-white/40 text-sm">
        연결 중...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 h-[75vh] relative">
      <div ref={videoRef} className="col-start-2 col-span-10 h-full relative">
        <LiveKitRoom
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          className="h-full w-full"
          // @ts-ignore
          adaptiveStream={true}
          dynacast={true}
        >
          <Video host_name={id} host_identity={id} />
        </LiveKitRoom>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AIAnswer answer={answer} />
        </div>
      </div>
      <AICopilot hostId={id} onAnswer={setAnswer} />
    </div>
  );
};

export default StudioLivePage;
