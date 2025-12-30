import { useConnectionState, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import React, { useEffect, useRef } from "react";

interface banner_props {
  token: string;
  user_id: string;
}

const BannerVideo = ({ token, user_id }: banner_props) => {
  const tracks = useTracks([Track.Source.Camera]).filter(
    (track) => track.participant.identity === user_id
  );
  const connect = useConnectionState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log("비디오 컴포넌트의 트랙", videoRef.current);
  }, [user_id]);
  useTracks([Track.Source.Microphone, Track.Source.Camera])
    .filter((track) => track.participant.identity === user_id)
    .forEach((track) => {
      if (videoRef.current) track.publication.track?.attach(videoRef.current);
    });
  return (
    <div>
      <div ref={wrapperRef} className="relative h-full flex">
        <video ref={videoRef} width="100%" />
      </div>
    </div>
  );
};

export default BannerVideo;
