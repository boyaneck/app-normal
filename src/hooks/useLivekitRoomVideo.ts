import {
  useConnectionState,
  useParticipants,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { useEffect, useState } from "react";

import { Track } from "livekit-client";
interface LivekitRoomVideoProps {
  host_name: string;
  host_identity: string;
  token: string;
}

export const useLivekitRoomVideo = ({
  host_name,
  host_identity,
  token,
}: LivekitRoomVideoProps) => {
  const participants = useParticipants();

  const connecion_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);

  useEffect(() => {}, []);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter(
    (track) => track.participant.identity === host_participant?.identity
  );
};
