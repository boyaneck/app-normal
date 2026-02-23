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
import Loading_Video from "./loading-screen";
import LiveVideo from "./live_video";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/store/socket_store";
import clsx from "clsx";
import { useStreamingBarStore } from "@/store/bar_store";
import { useVideoStore } from "@/store/video";
import { FaPlay } from "react-icons/fa";
import LoadingScreen from "./loading-screen";
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
    content = <LoadingScreen label={connection_state} />;
  } else if (!host_participant) {
    content = <Offline_Video user_name={host_name} />;
  } else if (tracks.length === 0) {
    content = (
      <p>
        {host_participant?.identity}
        <LoadingScreen label={connection_state} />
      </p>
    );
  } else if (true) {
    content = <LiveVideo participant={host_participant} />;
  }
  const [show_streaming_bar, set_show_streaming_bar] = useState(false);

  //스트리밍 페이지 메인 화면
  return (
    <div
      className={clsx(`
        h-full w-full group/main
        relative overflow-hidden
        bg-black/80 
         transition-all duration-300
         rounded-xl`)}
      onMouseOver={() => {
        set_show_streaming_bar(true);
      }}
      onMouseLeave={() => {
        set_show_streaming_bar(false);
      }}
    >
      {/* {content} */}

      <div
        className={clsx(
          "absolute bottom-0 left-0 w-full p-6 flex justify-between items-center gap-4",
          "transition-all duration-500 ease-in-out",
          show_streaming_bar
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="flex items-center ">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayButton();
            }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition active:scale-95"
          >
            {is_playing ? (
              <div className="flex gap-1">
                <div className="w-1 h-5 bg-white rounded-full" />
                <div className="w-1 h-5 bg-white rounded-full" />
              </div>
            ) : (
              <FaPlay className="ml-1" />
            )}
          </button>

          <div
            className={clsx(
              `transition-all duration-300 ease-out group/volume
              px-2 py-1.5 rounded-2xl
              bg-black/20 backdrop-blur-3xl
              border border-white/10
              shadow-[0_4px_16px_rgba(0,0,0,0.3)]
              cursor-pointer`,
            )}
          >
            <div
              className={clsx(
                `transition-all duration-200 ease-in-out 
                px-3 py-1.5 rounded-xl
                flex items-center gap-2 text-white/80 font-medium text-sm

              group-hover/volume:bg-white/10 group-hover/volume:text-white`,
              )}
            >
              볼륨조절
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border-white">
            라이브 버튼
          </div>
        </div>

        <div>
          <button className="text-white opacity-80 hover:opacity-100">
            Full
          </button>
        </div>
      </div>
    </div>
  );
};

export default Video;
