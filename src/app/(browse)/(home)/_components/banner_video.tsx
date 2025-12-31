import { useConnectionState, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import React, { useEffect, useRef } from "react";

interface banner_props {
  token: string;
  user_id: string;
}

const BannerVideo = ({ token, user_id }: banner_props) => {
  const connectionState = useConnectionState();

  // 1. 트랙 구독 최적화 (카메라와 마이크)
  const remoteTracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]);

  // 2. 특정 사용자의 트랙만 메모이제이션하여 추출
  const participantTracks = useMemo(() => {
    return remoteTracks.filter(
      (track) => track.participant.identity === user_id
    );
  }, [remoteTracks, user_id]);

  // 3. 비디오 트랙 수동 제어 (실력의 핵심: Lifecycle Management)
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const videoTrack = participantTracks.find(
      (t) => t.source === Track.Source.Camera
    )?.publication?.track;

    if (videoTrack) {
      videoTrack.attach(videoElement);

      // 언마운트 시 반드시 Detach하여 메모리 누수 방지 (시니어급 포인트)
      return () => {
        videoTrack.detach(videoElement);
      };
    }
  }, [participantTracks, videoRef]);

  // 4. 상태 플래그 정의
  const isConnecting =
    connectionState === ConnectionState.Connecting ||
    connectionState === ConnectionState.Reconnecting;
  const isOffline = !participantTracks.some(
    (t) => t.source === Track.Source.Camera
  );

  return (
    <div>
      <div ref={wrapperRef} className="relative h-full flex">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${
            isOffline ? "opacity-0" : "opacity-100"
          }`}
          autoPlay
          muted
          playsInline
        />
      </div>
    </div>
  );
};

export default BannerVideo;
