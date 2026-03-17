import { useViewerToken } from "@/hooks/useViewerToken";
import useUserStore from "@/store/user";
import {
  ConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import { createLocalVideoTrack, LocalVideoTrack } from "livekit-client";
import { Video } from "lucide-react";
import React, { useEffect } from "react";

const LiveScreen = () => {
  const { localParticipant } = useLocalParticipant();
  const ss = localParticipant.videoTracks;
  const local_track = createLocalVideoTrack();

  useEffect(() => {
    local_track.then((track) => {
      localParticipant.publishTrack(track);
      console.log("localpariticpant", localParticipant.publishTrack(track));
    });
  }, []);
  console.log("비디오 트랙 확인하기", local_track);
  return <div className=" ">스트리밍 화면</div>;
};

export default LiveScreen;
