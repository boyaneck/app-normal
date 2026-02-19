"use client";
import { Participant, RemoteParticipant, Track } from "livekit-client";
import { Video } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  GridLayout,
  useConnectionQualityIndicator,
  useConnectionState,
  useTrack,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { useVideoStore } from "@/store/video";

interface LiveVideoProps {
  participant: Participant;
}

const LiveVideo = ({ participant }: LiveVideoProps) => {
  const { is_playing, set_is_playing, togglePlayButton } = useVideoStore(
    (state) => state,
  );

  useEffect(() => {
    if (!videoRef.current) return;
    if (is_playing) {
      videoRef.current.play().catch((err) => {
        console.log("브라우저 정책으로 인해 video play 재생 실패", err);
      });
    } else {
      videoRef.current.pause();
    }
  }, [is_playing]);

  const controlVideoPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!is_playing) {
      e.currentTarget.pause();
    }
  };
  const connect = useConnectionState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapper_ref = useRef<HTMLDivElement>(null);

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

  return (
    <div>
      {/* <div ref={wrapper_ref} className="relative h-full flex">
        <video
          ref={videoRef}
          onPlay={controlVideoPlay}
          width="100%"
          autoPlay
          muted
          playsInline
        />
      </div> */}
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
