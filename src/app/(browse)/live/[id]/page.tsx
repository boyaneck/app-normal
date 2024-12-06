"use client";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Room } from "livekit-client";
import {
  LiveKitRoom,
  RoomContext,
  useConnectionState,
} from "@livekit/components-react";
import Video from "../_components/video";
const UserLivePage = () => {
  const search_params = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [connectionState, setConnectionState] = useState("");
  const id = search_params.get("user_id");
  const user_nickname = search_params.get("user_nickname");

  // useEffect(() => {
  //   const initializeRoom = async () => {
  //     const newRoom = new Room();
  //     await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!, token); // Replace with valid token
  //     setRoom(newRoom);
  //     setConnectionState(newRoom.state);
  //   };

  //   initializeRoom();

  //   return () => {
  //     room?.disconnect();
  //   };
  // }, []);

  // if (!room) {
  //   return <div>Loading room...</div>;
  // }
  console.log("유저의 정보", id, user_nickname);
  const current_id = id === null ? undefined : id;
  const current_user_nickname =
    user_nickname === null ? undefined : user_nickname;

  const { token, name, identity } = useViewrToken(
    current_id,
    current_user_nickname
  );

  console.log("다시하넙ㄴ ㅜ머가문제제인가요?", { token, name, identity });
  useEffect(() => {}, []);

  if (!token || !name || !identity) {
    return <div>Cannot watch the stream</div>;
  }

  return (
    <div>
      <div className="font-extrabold">유저의 스트리밍 페에지</div>

      <div>
        스크린
        {/* <LiveIndex user={""} stream="" is_following={[""]} token="" />잘 */}
        <LiveKitRoom
          token={token}
          server_url={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        >
          쭈루룩삥퐁뚝뚝뚝
          <Video host_name="" host_identity="" />
        </LiveKitRoom>
        나오고 있나요 ??
      </div>
    </div>
  );
};

export default UserLivePage;
