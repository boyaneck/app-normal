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
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import LoadingScreen from "./loading-screen";
import { FaCompress, FaExpand, FaPause } from "react-icons/fa6";
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

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // 볼륨 변경
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // 음소거 토글
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const [is_full_screen, set_is_full_screen] = useState(false);

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
            className="relative group/play flex items-center justify-center w-12 h-12 outline-none"
          >
            <div
              className={clsx(
                "absolute inset-0 flex items-center justify-center",
                "bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-xl",
                "p-1",
              )}
            >
              <div
                className={clsx(
                  "flex items-center justify-center w-full h-full rounded-full transition-all duration-300",
                  "group-hover/play:bg-white/15",
                )}
              >
                <div className="transition-all duration-100 active:scale-90 active:opacity-70">
                  {is_playing ? (
                    <div className="flex gap-1.5 items-center justify-center">
                      <div className="w-1 h-4 bg-white/90 rounded-full" />
                      <div className="w-1 h-4 bg-white/90 rounded-full" />
                    </div>
                  ) : (
                    <FaPlay className="text-white/90 translate-x-[0.5px] text-sm" />
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* 볼륨버튼 UI */}
          <div
            className="relative flex items-center group/ancestor"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            style={{ width: "44px" }}
          >
            <div
              className={clsx(
                "absolute left-0 flex items-center h-11 transition-all duration-500 ease-out",
                "bg-black/50 backdrop-blur-2xl rounded-full border border-white/10 shadow-xl",
                "p-1 overflow-hidden",
                showVolumeSlider ? "w-36 z-20" : "w-11 z-10",
              )}
            >
              <div
                className={clsx(
                  "flex items-center w-full h-full rounded-full transition-all duration-500",
                  "group-hover/ancestor:bg-white/15",
                )}
              >
                <div className="flex-shrink-0 w-9 h-full flex items-center justify-center">
                  <button
                    onClick={toggleMute}
                    className="text-white/80 transition-colors flex items-center justify-center"
                  >
                    {isMuted || volume === 0 ? (
                      <FaVolumeMute className="w-[18px] h-[18px]" />
                    ) : (
                      <FaVolumeUp className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>

                {/* 2. 슬라이더 영역 */}
                <div
                  className={clsx(
                    "flex items-center transition-all duration-500 h-full",
                    showVolumeSlider
                      ? "w-full opacity-100 pr-3"
                      : "w-0 opacity-0 pointer-events-none",
                  )}
                >
                  <div className="relative w-full h-3 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className={clsx(`
              h-[2px] w-full appearance-none bg-transparent cursor-pointer flex items-center
              [&::-webkit-slider-runnable-track]:h-[2px]
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-none 
              [&::-webkit-slider-thumb]:-mt-[5px] 
              
              active:[&::-webkit-slider-thumb]:scale-110 transition-all
            `)}
                      style={{
                        background: isMuted
                          ? `linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 100%)`
                          : `linear-gradient(to right, white 0%, white ${volume}%, rgba(255, 255, 255, 0.2) ${volume}%, rgba(255, 255, 255, 0.2) 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 볼륨버튼 UI */}
        </div>

        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="relative group/full flex items-center justify-center w-12 h-12 outline-none"
          >
            {/* [조상 레이어] 고정 베이스 */}
            <div
              className={clsx(
                "absolute inset-0 flex items-center justify-center transition-all duration-500",
                "bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-xl",
                "p-1",
              )}
            >
              {/* [부모 레이어] 호버 발광 */}
              <div
                className={clsx(
                  "flex items-center justify-center w-full h-full rounded-full transition-all duration-500",
                  "group-hover/full:bg-white/15",
                )}
              >
                {/* [아이콘 영역] 상태(isFullScreen)에 따라 아이콘 교체 및 떨림 방지 */}
                <div className="transition-all duration-100 active:scale-90 active:opacity-70 flex items-center justify-center">
                  {is_full_screen ? (
                    <FaCompress className="text-white/90 text-[16px]" />
                  ) : (
                    <FaExpand className="text-white/90 text-[16px]" />
                  )}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Video;
