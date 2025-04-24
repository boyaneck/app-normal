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
import { useSocketStore } from "@/store/socket_store";

interface VideoProps {
  host_name: string | undefined;
  host_identity: string;
  token: string;
  className?: string;
}
const Video = ({ host_name, host_identity, token }: VideoProps) => {
  const { socket, connect_socket } = useSocketStore();
  const participants = useParticipants();
  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  const [total_viewer, set_total_viewer] = useState<number>(0);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter(
    (track) => track.participant.identity === host_participant?.identity
  );
  const remote_participants = participants.filter(
    (participant) => participant instanceof RemoteParticipant
  );
  const all_remote_participant = remote_participants.map(
    (participant) => participant.identity
  );

  // 호스트를 제외한 방에 참가한 모든 유저
  const remote_participant_except_host = all_remote_participant.filter(
    (participant) => participant !== host_identity
  );
  useEffect(() => {
    if (!socket) {
      connect_socket();
      console.log("소켓에 연결되었습니다.");
    }
    set_total_viewer(participants.length - 1);
    socket?.emit("user_in_out", remote_participant_except_host);
  }, [total_viewer]);
  let user_info = {};
  console.log("호스트 제외한 유저 ? ", remote_participant_except_host);
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

  return (
    <div className="aspect-video object-contain group relative w-full">
      {content}
      <div>현재 모든 시청자 수 {total_viewer}</div>
    </div>
  );
};

export default Video;
