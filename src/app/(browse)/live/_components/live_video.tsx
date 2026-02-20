"use client";
import { Participant, Track } from "livekit-client";
import {
  useConnectionState,
  useTrack,
  VideoTrack,
} from "@livekit/components-react";
import { useVideoStore } from "@/store/video";
import { useEffect } from "react";

interface LiveVideoProps {
  participant: Participant;
}

const LiveVideo = ({ participant }: LiveVideoProps) => {
  const { is_playing, set_is_playing, togglePlayButton } = useVideoStore(
    (state) => state,
  );

  const { track: video_track, publication: video_publication } = useTrack({
    source: Track.Source.Camera,
    participant: participant,
  });
  const { track: audio_track, publication: audio_publication } = useTrack({
    source: Track.Source.Microphone,
    participant: participant,
  });
  const { track: screen_share_track, publication: screen_share_publication } =
    useTrack({ source: Track.Source.ScreenShare, participant: participant });

  if (!video_publication?.isSubscribed) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        {/* 비디오 로딩일때의 컴포넌트 만들어야함 */}
        <p className="text-white">📹 비디오 로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <VideoTrack
        trackRef={{
          participant: participant,
          source: Track.Source.Camera,
          publication: video_publication!,
        }}
        className="h-full w-full object-contain"
      />

      {/* 오디오 (자동 재생) */}
      {audio_track && audio_publication && (
        <VideoTrack
          trackRef={{
            participant: participant,
            source: Track.Source.Microphone,
            publication: audio_publication,
          }}
          className="hidden"
        />
      )}

      {/* 스크린쉐어 PIP */}
      {screen_share_track && screen_share_publication && (
        <div className="absolute bottom-4 right-4 w-64 h-36 rounded-lg overflow-hidden border-2 border-white/30 shadow-2xl">
          <VideoTrack
            trackRef={{
              participant: participant,
              source: Track.Source.ScreenShare,
              publication: screen_share_publication,
            }}
            className="h-full w-full object-contain bg-gray-900"
          />
          <div className="absolute top-2 left-2 backdrop-blur-xl bg-black/50 border border-white/20 rounded px-2 py-1">
            <span className="text-white text-xs font-medium">화면 공유</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
