"use client";

import React, { useEffect, useRef, useState } from "react";
import { ConnectionState, Track, RemoteParticipant } from "livekit-client";
import {
  useConnectionState,
  useTracks,
  useRemoteParticipant,
  useParticipants,
} from "@livekit/components-react";
import Offline_Video from "./offline_video";
import Loading_Video from "./loading_video";
import LiveVideo from "./live_video";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/store/socket_store";
import clsx from "clsx";
import { useStreamingBarStore } from "@/store/bar_store";
import { useVideoStore } from "@/store/video";
import { FaPlay } from "react-icons/fa";
interface VideoProps {
  host_name: string | undefined;
  host_identity: string;
  className?: string;
}
const Video = ({ host_name, host_identity }: VideoProps) => {
  const icon = useStreamingBarStore((state) => state.icon);
  const participants = useParticipants(); //
  const connection_state = useConnectionState();
  const host_participant = useRemoteParticipant(host_identity);
  const { is_playing, set_is_playing, togglePlayButton } = useVideoStore();

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter(
    (track) => track.participant.identity === host_participant?.identity,
  );
  const remote_participants = participants.filter(
    (participant) => participant instanceof RemoteParticipant,
  );
  const all_remote_participant = remote_participants.map(
    (participant) => participant.identity,
  );
  const remote_participant_except_host = all_remote_participant.filter(
    (participant) => participant !== host_identity,
  );

  //실시간 시청자를 확인하기 위한 socket----
  const { socket, connect_socket } = useSocketStore();
  const [total_viewer, set_total_viewer] = useState<number>(0);
  useEffect(() => {
    if (!socket) {
      connect_socket();
      console.log("소켓에 연결되었습니다.");
    }
    set_total_viewer(participants.length - 1);
    socket?.emit("user_in_out", remote_participant_except_host);
  }, []);
  //---------------------------
  let content;
  //서버와 연결은 되었는데 아직 room이 연결되지 않았을때
  if (connection_state !== ConnectionState.Connected) {
    content = <Loading_Video label={connection_state} />;
  } else if (!host_participant) {
    content = <Offline_Video user_name={host_name} />;
  } else if (tracks.length === 0) {
    content = (
      <p>
        {host_participant?.identity}
        <Loading_Video label={connection_state} />
      </p>
    );
  } else if (true) {
    content = <LiveVideo participant={host_participant} />;
  }
  const [show_streamer_info_bar, set_show_streamer_info_bar] = useState(false);

  //스트리밍 페이지 메인 화면
  return (
    <div
      className={clsx(
        `
        h-full w-full
        relative
        bg-black/80
        border border-red-500
         transition-all duration-300
         rounded-xl`,
      )}
      onMouseOver={() => {
        set_show_streamer_info_bar(true);
      }}
      onMouseLeave={() => {
        set_show_streamer_info_bar(false);
      }}
    >
      {content}
      {/* <div>현재 모든 시청자 수 {total_viewer}</div> */}
      {host_participant && <></>}
      <div
        className={clsx(
          "absolute z-10 bottom-0 flex felx-col border border-green-400 w-full",
        )}
      >
        <button
          onClick={togglePlayButton} // 클릭 시 true -> false, false -> true 토글
          className="
        group
        flex items-center justify-center
        w-12 h-12 
        rounded-full 
        bg-white/10 
        backdrop-blur-md 
        border border-white/20 
        text-white 
        transition-all 
        duration-300
        hover:bg-white/20
        hover:scale-105
        active:scale-95
      "
        >
          {is_playing ? (
            /* 일시정지 아이콘 (재생 중일 때 보여줌) */
            <div className="flex gap-1">
              <div className="w-1 h-5 bg-white rounded-full"></div>
              <div className="w-1 h-5 bg-white rounded-full"></div>
            </div>
          ) : (
            /* 재생 아이콘 (정지 중일 때 보여줌) */
            <FaPlay />
          )}
        </button>
      </div>
    </div>
  );
};

export default Video;
