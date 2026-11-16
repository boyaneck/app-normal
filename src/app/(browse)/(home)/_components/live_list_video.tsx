import { useTracks, VideoTrack } from "@livekit/components-react";
import { RemoteTrackPublication, Track, VideoQuality } from "livekit-client";
import React, { useEffect } from "react";

/**
 * 미리보기 방 안에서 송출자의 영상 트랙을 찾아 그린다 (LiveKitRoom 안에서 렌더링)
 * - OBS(Ingress)와 브라우저 카메라 송출 모두 Camera 소스로 들어온다.
 * - 미리보기는 작은 카드라서 가장 낮은 화질(simulcast 하위 레이어)만 받아 전송량을 아낀다.
 *
 * 예전 문제: 트랙은 찾았지만 영상 대신 "LiveListVideo" 글자만 렌더링하고 있었다.
 */
const LiveListVideo = () => {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const trackRef = tracks.find((t) => !t.participant.isLocal);

  useEffect(() => {
    // 화질 설정은 track이 아니라 publication(구독 정보)에 있는 메서드
    const publication = trackRef?.publication;
    if (publication instanceof RemoteTrackPublication) {
      publication.setVideoQuality(VideoQuality.LOW);
    }
  }, [trackRef]);

  if (!trackRef) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
      </div>
    );
  }

  return <VideoTrack trackRef={trackRef} className="h-full w-full object-cover" muted />;
};

export default LiveListVideo;
