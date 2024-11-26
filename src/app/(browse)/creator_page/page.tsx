"use client";
import React from "react";
import { AccessToken } from "livekit-server-sdk";
import useUserStore from "@/store/user";
import Live_Player from "../_components/live_screen/live_player";
import useFollowingUserStore from "@/store/following_user";
interface CreatorPageProps {
  params: {
    username: string;
  };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const external_user = "";
  const { user } = useUserStore((state) => state);
  const { following_user } = useFollowingUserStore((state) => state);
  //현재 스트리머와 로그인한 유저
  console.log("쭈르릅", user);
  console.log("뭐임 왜 여기로나옴 ?");
  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET_KEY = process.env.LIVEKIT_API_SECRET;

  return (
    <div>
      {/* /파라미터로 현재 user와 user안에 있는 stream 값을 넘겨준다 */}
      <Live_Player user={user} stream={""} is_following={following_user} />
      추르릅춥춥
    </div>
  );
};

export default CreatorPage;
