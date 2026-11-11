"use client";

import { useEffect, useState } from "react";
import { ConnectionState, Track, VideoPresets } from "livekit-client";
import {
  useConnectionState,
  useLocalParticipant,
  useLocalParticipantPermissions,
  VideoTrack,
} from "@livekit/components-react";
import { motion, AnimatePresence } from "framer-motion";
import Video from "@/app/(browse)/live/_components/video";
import type { LiveStatus } from "@/api/live";

/**
 * 호스트 방송 화면 (LiveKitRoom 안에서 렌더링)
 *
 * 흐름: [카메라로 방송 시작] → 브라우저가 카메라·마이크를 LiveKit에 WebRTC로 송출
 *      → LiveKit 웹훅(track_published) → 서버가 status = live → 홈 목록에 노출
 * 브라우저는 status를 직접 바꾸지 않는다. "진짜 송출 중인지"는 LiveKit만 알기 때문.
 *
 * 카메라를 켜지 않으면 기존처럼 OBS 송출 화면(<Video>)을 보여준다.
 */

// 무료 한도(전송량)를 아끼기 위해 540p로 제한
const CAMERA_PRESET = VideoPresets.h540;
// 송출은 시작했는데 이 시간 안에 live가 안 되면 웹훅 문제일 가능성이 크다
const WEBHOOK_HINT_DELAY_MS = 12_000;

type Props = {
  hostId: string;
  liveStatus: LiveStatus | null | undefined;
};

const HostBroadcast = ({ hostId, liveStatus }: Props) => {
  const connectionState = useConnectionState();
  const permissions = useLocalParticipantPermissions();
  const { localParticipant, isCameraEnabled, cameraTrack } = useLocalParticipant();

  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showWebhookHint, setShowWebhookHint] = useState(false);

  const isLive = liveStatus === "live";
  const isConnected = connectionState === ConnectionState.Connected;

  // 송출 중인데 서버가 live로 안 바꾸면 안내 (로컬에서 ngrok이 꺼져 있는 경우 등)
  useEffect(() => {
    if (!isCameraEnabled || isLive) {
      setShowWebhookHint(false);
      return;
    }
    const timer = setTimeout(() => setShowWebhookHint(true), WEBHOOK_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isCameraEnabled, isLive]);

  const startCameraBroadcast = async () => {
    if (isStarting) return;
    setErrorMsg(null);

    if (!permissions?.canPublish) {
      setErrorMsg("송출 권한이 없어요. 이 방의 호스트로 로그인했는지 확인해주세요.");
      return;
    }

    setIsStarting(true);
    try {
      await localParticipant.setCameraEnabled(
        true,
        { resolution: CAMERA_PRESET.resolution },
        { videoEncoding: CAMERA_PRESET.encoding, simulcast: true },
      );
      await localParticipant.setMicrophoneEnabled(true);
    } catch (error) {
      console.error("브라우저 송출 시작 실패:", error);
      setErrorMsg(explainMediaError(error));
      // 카메라는 켜졌는데 마이크에서 실패한 경우 등: 반쯤 켜진 상태로 두지 않는다
      await localParticipant.setCameraEnabled(false).catch(() => {});
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      {isCameraEnabled && cameraTrack ? (
        // 내 카메라 미리보기 (거울 모드)
        <div className="h-full w-full rounded-xl overflow-hidden bg-black">
          <VideoTrack
            trackRef={{
              participant: localParticipant,
              source: Track.Source.Camera,
              publication: cameraTrack,
            }}
            className="h-full w-full object-cover -scale-x-100"
          />
        </div>
      ) : (
        // 카메라를 안 켰으면 기존 OBS 송출 화면
        <Video host_name={hostId} host_identity={hostId} />
      )}

      {/* 송출 대기: 카메라도 꺼져 있고 OBS로도 아직 live가 아닐 때 */}
      <AnimatePresence>
        {!isCameraEnabled && !isLive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-xl text-center px-6"
          >
            <p className="text-white/85 text-sm font-medium">방송을 시작할 준비가 됐어요</p>

            <motion.button
              onClick={startCameraBroadcast}
              disabled={isStarting || !isConnected}
              whileHover={isStarting ? undefined : { scale: 1.03 }}
              whileTap={isStarting ? undefined : { scale: 0.97 }}
              className="h-11 px-6 rounded-2xl text-[13px] font-semibold tracking-tight disabled:opacity-50 disabled:cursor-wait"
              style={{
                background: "rgba(239,68,68,0.9)",
                color: "white",
                boxShadow: "0 4px 20px rgba(239,68,68,0.35)",
              }}
            >
              {isStarting ? "카메라 준비 중..." : !isConnected ? "연결 중..." : "📷 카메라로 방송 시작"}
            </motion.button>

            {errorMsg ? (
              <p className="text-red-300 text-xs max-w-xs">{errorMsg}</p>
            ) : (
              <p className="text-white/40 text-xs">
                OBS로 송출하면 자동으로 방송이 시작돼요
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 송출은 시작했지만 서버가 아직 live로 확인하기 전 */}
      <AnimatePresence>
        {isCameraEnabled && !isLive && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-4 z-[6] max-w-sm rounded-xl px-3 py-2 bg-black/60 backdrop-blur-md text-[12px] text-white/85"
          >
            {showWebhookHint
              ? "서버가 아직 송출을 확인하지 못했어요. (로컬이라면 ngrok과 LiveKit 웹훅 주소를 확인해주세요)"
              : "송출 중 · 서버가 확인하면 LIVE로 바뀌어요"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** 카메라·마이크 에러 → 화면에 보여줄 원인 */
const explainMediaError = (error: unknown) => {
  const name = (error as { name?: string })?.name;
  if (name === "NotAllowedError")
    return "카메라·마이크 권한이 거부됐어요. 주소창 왼쪽 아이콘에서 권한을 허용해주세요.";
  if (name === "NotFoundError") return "카메라나 마이크를 찾을 수 없어요.";
  if (name === "NotReadableError")
    return "다른 프로그램이 카메라를 사용 중이에요. (OBS, 화상회의 앱 등을 꺼주세요)";
  return "송출을 시작하지 못했어요. 잠시 후 다시 시도해주세요.";
};

export default HostBroadcast;
