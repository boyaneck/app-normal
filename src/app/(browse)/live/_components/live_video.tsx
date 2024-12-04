"use client";
import { Participant, Track } from "livekit-client";
import { Video } from "lucide-react";
import React, { useRef } from "react";
import { useTrack, useTracks } from "@livekit/components-react";
interface LiveVideoProps {
  participant: Participant;
}

const Live_Video = ({ participant }: LiveVideoProps) => {
  const video_ref = useRef<HTMLVideoElement>(null);
  const wrapper_ref = useRef<HTMLDivElement>(null);
  useTracks([Track.Source.Microphone, Track.Source.Camera])
    .filter((track) => {
      track.participant.identity === participant.identity;
    })
    .forEach((track) => {
      if (video_ref.current) {
        track.publication.track?.attach(video_ref.current);
      }
    });
  return (
    <div>
      Live_Video
      <div ref={wrapper_ref} className="relative h-full flex">
        <video ref={video_ref} width="100%" />
      </div>
    </div>
  );
};

export default Live_Video;
