"use client";
import React from "react";
import { AccessToken } from "livekit-server-sdk";
import useUserStore from "@/store/user";
import Stream_Player from "../_components/stream_player";
interface CreatorPageProps {
  params: {
    username: string;
  };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const external_user = "";
  const current_user = useUserStore((state) => state);

  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET_KEY = process.env.LIVEKIT_API_SECRET;

  return (
    <div>
      {/* /파라미터로 현재 user와 user안에 있는 stream 값을 넘겨준다 */}
      <Stream_Player user={"user"} stream={""} is_following={""} />
      추르릅춥춥
    </div>
  );
};

export default CreatorPage;
