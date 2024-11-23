"use client";
import { useViewrToken } from "@/hooks/useViewrToekn";
import React from "react";

interface StreamPlayerProps {
  user: string;
  stream: string;
  is_following: string;
}

const Stream_Player = ({ user, stream, is_following }: StreamPlayerProps) => {
  const { token, name, identity } = useViewrToken(user.id);

  if (!token || !name || identity) {
    return <div>Cannot watch the stream</div>;
  }

  return <div>Stream_Player</div>;
};

export default Stream_Player;
