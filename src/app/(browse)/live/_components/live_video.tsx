"use client";
import { Participant, RemoteParticipant, Track } from "livekit-client";
import { Video } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  GridLayout,
  useConnectionState,
  useTrack,
  useTracks,
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
    if (is_playing) videoRef.current.play();
    else videoRef.current.pause();
  }, [is_playing]);

  const controlVideoPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!is_playing) {
      e.currentTarget.pause();
    }
  };
  const connect = useConnectionState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapper_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("비디오 컴포넌트의 트랙", videoRef.current);
  }, [participant]);
  useTracks([Track.Source.Microphone, Track.Source.Camera])
    .filter((track) => track.participant.identity === participant.identity)
    .forEach((track) => {
      if (videoRef.current) track.publication.track?.attach(videoRef.current);
    });
  return (
    <div>
      <div ref={wrapper_ref} className="relative h-full flex">
        <video ref={videoRef} onPlay={controlVideoPlay} width="100%" />
      </div>
    </div>
  );
};

export default LiveVideo;
