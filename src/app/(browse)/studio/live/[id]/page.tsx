"use client";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useRef, useState, useEffect } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import Video from "@/app/(browse)/live/_components/video";
import ChatPage from "@/app/(browse)/chat/page";
import AICopilot from "./_components/AI-copilot";
import AIAnswer from "./_components/AI-answer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const StudioLivePage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { token } = useViewerToken(id);

  const videoRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const isHoveredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionsRef = useRef({ scheduleHide: () => {} });

  // 4초 후 패널 자동 닫기 (hover 중이면 onMouseLeave에서 재호출)
  actionsRef.current.scheduleHide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isHoveredRef.current) {
        setAnswer("");
        setIsExpanded(false);
      }
    }, 4000);
  };

  // 코파일럿 소켓 연결 — 채팅 스파이크 발생 시 서버가 push
  useEffect(() => {
    if (!token) return;

    const copilotSocket = io("http://localhost:3001/copilot", {
      auth: { token },
      query: { hostId: id },
      transports: ["websocket"],
    });

    copilotSocket.emit("copilot-connected");

    copilotSocket.on("copilotInsight", (insight: string) => {
      setAnswer(insight);
      setIsExpanded(false);
      actionsRef.current.scheduleHide();
    });

    return () => {
      copilotSocket.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, id]);

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
      <div className="flex items-center justify-center h-screen text-white/40 text-sm">
        연결 중...
      </div>
    );
  }

  return (
    <div>
      <div className="fixed top-0 left-0 h-20 flex items-center z-50" style={{ paddingLeft: 92 }}>
        <Link href="/">
          <img
            src="/images/appnormal_logo.svg"
            alt="appnormal logo"
            className="h-[56px] w-auto cursor-pointer"
          />
        </Link>
      </div>

      <div className="grid grid-cols-12 h-[75vh] mt-[100px] relative">

        {/* 방송 화면 */}
        <div ref={videoRef} className="col-start-2 col-span-7 h-full relative">
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

          {/* 모달 백드롭 (비디오 위, 코파일럿 아래) */}
          <div
            className={`absolute inset-0 z-10 bg-black/65 pointer-events-none transition-opacity duration-500 ${
              answer ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* AI 코파일럿 — z-20 으로 백드롭 위에 노출 */}
          <div className="absolute bottom-4 right-4 z-20 w-52 h-40 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10">
            <AICopilot hostId={id} onAnswer={setAnswer} />
          </div>
        </div>

        {/* 채팅 패널 */}
        <div
          className={`col-start-9 col-span-3 overflow-hidden relative h-full ml-4 rounded-xl border border-black transition-all duration-500 ${
            answer ? "opacity-[0.08]" : "opacity-100"
          }`}
        >
          <div className="absolute inset-0 z-10">
            <ChatPage current_host_nickname={id} current_host_id={id} />
          </div>
        </div>

        {/* GROQ LLM 응답 패널 — 채팅 위 수직 중앙 오버레이 */}
        <AnimatePresence>
          {answer && (
            <motion.div
              className="absolute z-30 flex items-center"
              style={{
                left: "calc(66.667% + 1rem)",
                right: "0",
                top: "0",
                bottom: "0",
                padding: "0 1rem",
              }}
              onMouseEnter={() => {
                isHoveredRef.current = true;
                if (timerRef.current) clearTimeout(timerRef.current);
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
                actionsRef.current.scheduleHide();
              }}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <AIAnswer
                answer={answer}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded((prev) => !prev)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default StudioLivePage;
