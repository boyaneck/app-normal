"use client";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useRef, useState, useEffect } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import HostBroadcast from "./_components/host-broadcast";
import ChatPage from "@/app/(browse)/chat/chat-page";
import AICopilot from "./_components/AI-copilot";
import AIAnswer from "./_components/AI-answer";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endLive, getLiveStatus, LiveStatus } from "@/api/live";
import { SERVER_URL } from "@/lib/server-api";

// 서버가 보내는 코파일럿 멘트. id는 👍/👎 피드백용 (기록 실패 시 null)
type CopilotInsight = { id: number | string | null; line: string };

const StudioLivePage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { token } = useViewerToken(id);

  const videoRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [insightId, setInsightId] = useState<CopilotInsight["id"]>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const copilotSocketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // 방송 상태: waiting(OBS 대기) → live → ending → ended
  // live로 바꾸는 건 서버(LiveKit 웹훅)라서, 여기서는 주기적으로 확인만 한다
  const { data: liveStatus } = useQuery({
    queryKey: ["liveStatus", id],
    queryFn: () => getLiveStatus(id),
    refetchInterval: 3000,
  });

  const goToStats = () => {
    queryClient.invalidateQueries({ queryKey: ["liveStatsWeek"] });
    router.push("/studio?tab=liveStat");
  };

  // OBS를 직접 꺼서 서버가 정리를 끝낸 경우(live/ending → ended)에도 통계 페이지로 이동
  // (페이지에 들어왔을 때 이미 ended인 건 지난 방송이라 이동하지 않는다)
  const prevStatusRef = useRef<LiveStatus | null>(null);
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (liveStatus) prevStatusRef.current = liveStatus;
    if (!isEnding && liveStatus === "ended" && (prev === "live" || prev === "ending")) {
      goToStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStatus]);

  const handleEndLive = async () => {
    if (isEnding) return;
    const ok = window.confirm(
      "방송을 종료할까요?\n종료하면 통계가 저장되고 통계 페이지로 이동해요.\n(OBS의 송출도 함께 꺼주세요)",
    );
    if (!ok) return;

    setIsEnding(true);
    setEndError(null);
    try {
      await endLive();
      goToStats();
    } catch (error) {
      console.error("방송 종료 실패:", error);
      setEndError("방송 종료에 실패했어요. 다시 시도해주세요.");
      setIsEnding(false);
    }
  };

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

    const copilotSocket = io(`${SERVER_URL}/copilot`, {
      auth: { token },
      query: { hostId: id },
      transports: ["websocket"],
    });

    copilotSocket.emit("copilot-connected");

    // 재연결(서버 재시작 등) 시 room에서 빠지므로 다시 join 필요
    const rejoinCopilotRoom = () => {
      copilotSocket.emit("copilot-connected");
    };
    copilotSocket.io.on("reconnect", rejoinCopilotRoom);

    copilotSocket.on("connect_error", (err) => {
      console.error("[코파일럿 소켓] 연결 실패:", err.message);
    });

    copilotSocket.on("copilotInsight", (insight: CopilotInsight | string) => {
      // 예전 서버는 문자열만 보냈다 → 두 형태 모두 처리
      const { id: nextId, line } =
        typeof insight === "string" ? { id: null, line: insight } : insight;
      setAnswer(line);
      setInsightId(nextId);
      setIsExpanded(false);
      actionsRef.current.scheduleHide();
    });
    copilotSocketRef.current = copilotSocket;

    // 새로고침/탭 닫기로 브라우저가 페이지를 통째로 날릴 때는
    // React cleanup이 실행 안 될 수 있어서, 언로드 직전에 직접 끊어줌
    const handleBeforeUnload = () => {
      copilotSocket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      copilotSocket.io.off("reconnect", rejoinCopilotRoom);
      copilotSocket.disconnect();
      copilotSocketRef.current = null;
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

  // 송출 전 상태: 설정 페이지는 status를 바꾸지 않으므로 지난 방송의 ended가 남아 있을 수 있다
  const isWaiting = liveStatus !== "live" && liveStatus !== "ending";

  return (
    <div>
      {/* 상단 바: 방송 상태 + 방송 종료 */}
      <div className="grid grid-cols-12 mb-3">
        <div className="col-start-2 col-span-10 flex items-center justify-between">
          <LiveStatusBadge status={isWaiting ? "ready" : liveStatus} />
          <div className="flex items-center gap-3">
            {endError && <span className="text-[12px] text-red-500/80">{endError}</span>}
            <motion.button
              onClick={handleEndLive}
              disabled={isEnding}
              whileHover={isEnding ? undefined : { scale: 1.02 }}
              whileTap={isEnding ? undefined : { scale: 0.97 }}
              className="h-9 px-5 rounded-xl text-[12px] font-semibold tracking-tight transition-opacity disabled:opacity-50 disabled:cursor-wait"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "0.5px solid rgba(239,68,68,0.25)",
                color: "rgba(220,38,38,0.85)",
              }}
            >
              {isEnding ? "통계 정리 중..." : "방송 종료"}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 h-[75vh] relative">
        {/* 방송 화면 */}
        <div ref={videoRef} className="col-start-2 col-span-7 h-full relative">
          {/* 마이크·카메라는 접속하자마자 켜지 않는다. 호스트가 "방송 시작"을 눌렀을 때만 켠다 */}
          <LiveKitRoom
            audio={false}
            video={false}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
            className="h-full w-full"
            // @ts-ignore
            adaptiveStream={true}
            dynacast={true}
          >
            <HostBroadcast hostId={id} liveStatus={liveStatus} />
          </LiveKitRoom>

          {/* 모달 백드롭 (비디오 위, 코파일럿 아래) */}
          <div
            className={`absolute inset-0 z-10 bg-black/65 pointer-events-none transition-opacity duration-500 ${
              answer ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* AI 코파일럿 — z-20 으로 백드롭 위에 노출 */}
          <div className="absolute bottom-4 right-4 z-20 w-52 h-40 bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10">
            <AICopilot
              hostId={id}
              onAnswer={(text) => {
                setAnswer(text);
                setInsightId(null); // 음성 질문 답변은 피드백 대상이 아님
              }}
            />
          </div>
        </div>

        {/* 채팅 패널 */}
        <div
          className={`col-start-9 col-span-3 overflow-hidden relative h-full ml-4 rounded-xl border border-black/[0.07] shadow-[0_1px_12px_rgba(0,0,0,0.04)] transition-all duration-500 ${
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
                onFeedback={
                  insightId != null
                    ? (feedback) =>
                        copilotSocketRef.current?.emit("copilot-feedback", {
                          insightId,
                          feedback,
                        })
                    : undefined
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const STATUS_LABEL: Record<LiveStatus, { text: string; color: string }> = {
  ready: { text: "송출 대기", color: "rgba(14,165,233,0.9)" },
  waiting: { text: "OBS 연결 대기", color: "rgba(14,165,233,0.9)" },
  live: { text: "LIVE", color: "rgba(239,68,68,0.95)" },
  ending: { text: "종료 처리 중", color: "rgba(234,179,8,0.95)" },
  ended: { text: "방송 종료됨", color: "rgba(0,0,0,0.35)" },
};

const LiveStatusBadge = ({ status }: { status: LiveStatus | null | undefined }) => {
  if (!status) return <span />;
  const { text, color } = STATUS_LABEL[status];
  return (
    <span
      className="flex items-center gap-2 text-[12px] font-semibold tracking-wide"
      style={{ color }}
    >
      <motion.span
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
        animate={status === "live" ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
        transition={status === "live" ? { duration: 1.2, repeat: Infinity } : undefined}
      />
      {text}
    </span>
  );
};

export default StudioLivePage;
