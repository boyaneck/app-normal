"use client";

import React from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useTracks,
  useRemoteParticipant,
} from "@livekit/components-react";
import Offline_Video from "./offline_video";
import Loading_Video from "./loading_video";

interface VideoProps {
  host_name: string;
  host_identity: string;
}

const Video = ({ host_name, host_identity }: VideoProps) => {
  const connection_state = useConnectionState();
  const participant = useRemoteParticipant(host_identity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === host_identity);

  let content;

  if (!participant && connection_state === ConnectionState.Connected) {
    content = (
      <p>
        Host is offline
        <p>
          <Offline_Video user_name={host_name} />
        </p>
      </p>
    );
  } else if (!participant || tracks.length === 0) {
    content = (
      <p>
        Loading...
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else {
    content = <p>Live video</p>;
  }
  return <div className="aspect-video border-b group relative">Video</div>;
};

export default Video;
