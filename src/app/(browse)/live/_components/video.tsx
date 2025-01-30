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

  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  useEffect(() => {}, [connection_state, host_participant, participants]);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter(
    (track) => track.participant.identity === host_participant?.identity
  );

  let content;
  //서버와 연결은 되었는데 아직 room이 연결되지 않았을때때
  if (connection_state !== ConnectionState.Connected) {
    content = (
      <p>
        Loading... room이 생성중 잠시만 기다려주세요요
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else if (!host_participant) {
    content = (
      <p>
        호스트가 방송중이 아닙니다다
        <p className="font-extrabold">is Offline !!@</p>
        <p>
          <Offline_Video user_name={host_name} />
        </p>
      </p>
    );
  } else if (tracks.length === 0) {
    content = (
      <p>
        {host_participant?.identity}
        ///////
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else if (true) {
    content = (
      <div>
        <LiveVideo participant={host_participant} />
      </div>
    );
  }
  // if (true) {
  //   return (<div>ddddzzzd
  //     <LiveVideo participant={host_participant}
  //   </div>)
  // }
  return (
    <div className="aspect-video border-b group relative border border-green-500">
      {content}
      {/* <LiveVideo participant={host_participant} /> */}
    </div>
  );
};

export default Video;
