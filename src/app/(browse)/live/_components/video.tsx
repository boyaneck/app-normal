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
  useEffect(() => {
    console.log("넘겨준 호스트 id", host_identity);
    console.log("호스트:", host_participant);
    console.log("현재 접속한 유저:", participants);
    console.log("넘겨준 호스트 아이디", host_identity);
  }, [connection_state, host_participant, participants]);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === host_identity);

  console.log("연결은? ??", connection_state);
  console.log("트랙은 ??", tracks);
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
        Loading... 이거 안나오나염 ??
        <p>
          <Loading_Video label={connection_state} />
        </p>
      </p>
    );
  } else if (true) {
    content = (
      <div>
        에에에에에에 우소!!
        <LiveVideo participant={host_participant} />
        쭈르륵쭈르륵 빵핑봉 ;
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
      Video 컴포넌트인데 아무것도 안나옴 ?<div>ddddddddd</div>`{content}
      {/* <LiveVideo participant={host_participant} /> */}
    </div>
  );
};

export default Video;
