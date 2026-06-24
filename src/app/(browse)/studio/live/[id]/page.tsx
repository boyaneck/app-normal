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
  // --- 코파일럿 소켓 연결 ---
  useEffect(() => {
    if (!token) return; // 토큰 받기 전엔 연결 안 함

    const copilotSocket = io("http://localhost:3001/copilot", {
      auth: { token }, // authorizeHost가 검증할 그 토큰
      transports: ["websocket"],
    });

    copilotSocket.on("connect", () => {
      console.log("[Copilot] 연결 성공:", copilotSocket.id);
      copilotSocket.emit("copilot-connected"); // 서버가 socket.data.roomName으로 room join
    });

    copilotSocket.on("copilotInsight", (insight: string) => {
      setAnswer(insight); // 기존 AIAnswer 컴포넌트 재사용
    });

    copilotSocket.on("connect_error", (err) => {
      console.error("[Copilot] 연결 실패:", err.message); // UNAUTHORIZED / NOT_LIVE 등
    });

    return () => {
      copilotSocket.disconnect();
    };
  }, [token]);
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
