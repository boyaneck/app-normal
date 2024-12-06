"use client";

import React from "react";
import { ConnectionState, Room, Track } from "livekit-client";
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
  const room = new Room();

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
        host is offline host is offline host is offline
        <p className="font-extrabold">is Offline !!@</p>
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
  return (
    <div className="aspect-video border-b group relative">
      Video 컴포넌트인데 아무것도 안나옴 ?<div>ddddddddd</div>`
    </div>
  );
};

export default Video;
