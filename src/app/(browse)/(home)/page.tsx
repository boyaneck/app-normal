"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import Screen from "./_components/screen";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}

export default function Home() {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const {
    data: LiveUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  console.log("라이브유저의 정보", LiveUser);
  useEffect(() => {
    if (LiveUser) {
      setLiveUser(LiveUser);
    }
  }, [LiveUser]);

  if (isLoading) {
    return <div>데이터를 가져오고 있습니다</div>;
  }
  return (
    <div className="bg-yellow-300 z-50">
      <Screen />
    </div>
  );
}
