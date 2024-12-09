"use client";

import React from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useTracks,
  useRemoteParticipant,
  useParticipants,
} from "@livekit/components-react";
import Offline_Video from "./offline_video";
import Loading_Video from "./loading_video";
import LiveVideo from "./live_video";

interface VideoProps {
  host_name: string;
  host_identity: string;
}

const Video = ({ host_name, host_identity }: VideoProps) => {
  const participants = useParticipants();
  console.log("현재해당룸에 참여한 모든 유저의 정보", participants);
  const object_host_participant = participants.find(
    (participant) => participant.identity === host_identity
  );
  console.log(
    "현재 스트리밍한 유저의 정보객체",
    object_host_participant,
    "그리고 ",
    participants
  );
  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === host_identity);

  console.log("트랙을 한번 알아보자", tracks);

  let content;

  if (!host_participant && connection_state === ConnectionState.Connected) {
    content = (
      <p>
        host is offline host is offline host is offline
        <p className="font-extrabold">is Offline !!@</p>
        <p>
          <Offline_Video user_name={host_name} />
        </p>
      </p>
    );
  } else if (!host_participant || tracks.length === 0) {
    content = (
      <p>
        Loading... 이거 안나오나염 ??
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else {
    content = <p>Live video 가 지금 시작됩니다!!</p>;
  }
  return (
    <div className="aspect-video border-b group relative">
      Video 컴포넌트인데 아무것도 안나옴 ?<div>ddddddddd</div>`
      <LiveVideo participant={""} />
    </div>
  );
};

export default Video;
