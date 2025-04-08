"use client";

import React, { useEffect, useState } from "react";
import {
  ConnectionState,
  Track,
  Participant,
  Room,
  ConnectionCheck,
  RemoteParticipant,
  RoomEvent,
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
  host_name: string | undefined;
  host_identity: string;
  token: string;
  className?: string;
}
const Video = ({ host_name, host_identity, token }: VideoProps) => {
  const participants = useParticipants();
  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  const [room, set_room] = useState<Room | null>(null);

  const [total_viewer, set_total_viewer] = useState<number>();
  useEffect(() => {
    
   
  }, [connection_state, host_participant, participants]);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter(
    (track) => track.participant.identity === host_participant?.identity
  );
  useEffect(() => {
    set_total_viewer(participants.length - 1);
  }, []);

  let content;
  //서버와 연결은 되었는데 아직 room이 연결되지 않았을때
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

  let peak_viewers_minute = 0;
  let peak_viewers_hour = 0;

  // Room.on("participantConnected");
  return (
    <div className="aspect-video object-contain group relative w-full">
      {content}
      <div>현재 모든 시청자 수 {total_viewer}</div>
      {/* <LiveVideo participant={host_participant} /> */}
    </div>
  );
};

export default Video;
