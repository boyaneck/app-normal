"use client";
import { Participant, RemoteParticipant, Track } from "livekit-client";
import { Video } from "lucide-react";
import React, { useEffect, useRef } from "react";
import {
  useConnectionState,
  useTrack,
  useTracks,
} from "@livekit/components-react";

interface LiveVideoProps {
  participant: Participant;
}

const LiveVideo = ({ participant }: LiveVideoProps) => {
  const connect = useConnectionState();
  const video_ref = useRef<HTMLVideoElement>(null);
  const wrapper_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("비디오 컴포넌트의 트랙", video_ref.current);
  }, [participant]);
  useTracks([Track.Source.Microphone, Track.Source.Camera])
    .filter((track) => track.participant.identity === participant.identity)
    .forEach((track) => {
      if (video_ref.current) track.publication.track?.attach(video_ref.current);
    });
  return (
    <div>
      <div ref={wrapper_ref} className="relative h-full flex">
        <video ref={video_ref} width="100%" />
      </div>
    </div>
  );
};

export default LiveVideo;
