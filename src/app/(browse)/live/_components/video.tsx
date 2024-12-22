"use client";

import React, { useEffect } from "react";
import {
  ConnectionState,
  Track,
  Participant,
  Room,
  ConnectionCheck,
  RemoteParticipant,
} from "livekit-client";
import {
  useConnectionState,
  useTracks,
  useRemoteParticipant,
  useParticipants,
  useRoomInfo,
  UseRoomInfoOptions,
  GridLayout,
  ParticipantTile,
} from "@livekit/components-react";
import Offline_Video from "./offline_video";
import Loading_Video from "./loading_video";
import LiveVideo from "./live_video";
import { Button } from "@/components/ui/button";

interface VideoProps {
  host_name: string;
  host_identity: string;
  token: string;
}
const Video = ({ host_name, host_identity, token }: VideoProps) => {
  const participants = useParticipants();

  const object_host_participant = participants.find(
    (participant) => participant.identity === host_identity
  );

  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  console.log("이게 비동기라서 그런가 ??", connection_state);
  useEffect(() => {
    console.log("호스트의 아이디는 ?", host_identity);
    console.log("현재 room 연결 유무:", connection_state);
    console.log("호스트:", host_participant);
    console.log("현재 접속한 유저저:", participants);
  }, [connection_state, host_participant, participants]);
  // const host_participant = useRemoteParticipant();
  const real = host_participant !== undefined ? host_participant : "";

  const host_id =
    host_identity !== undefined ? host_participant : host_participant;
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === host_identity);

  console.log("트랙은 ??", tracks);
  let content;
  if (connection_state !== ConnectionState.Connected) {
    content = (
      <p>
        Loading...
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else if (!host_participant) {
    content = (
      <p>
        host is offline host is offline host is offline
        <p className="font-extrabold">is Offline !!@</p>
        <p>
          <Offline_Video user_name={host_name} />
        </p>
      </p>
    );
  } else if (tracks.length === 0) {
    content = (
      <p>
        Loading... 이거 안나오나염 ??
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else {
    content = (
      <div>
        <LiveVideo participant={host_participant} />
        <GridLayout
          tracks={tracks}
          style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
        >
          ParticipantTile
        </GridLayout>
        ;
      </div>
    );
  }
  return (
    <div className="aspect-video border-b group relative border border-green-500">
      Video 컴포넌트인데 아무것도 안나옴 ?<div>ddddddddd</div>`
      {/* <LiveVideo participant={host_participant} /> */}
    </div>
  );
};

export default Video;
