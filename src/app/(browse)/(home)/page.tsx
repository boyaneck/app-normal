"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}

export default function Home() {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  console.log("라이브유저 zustand 관리", liveuser);
  const query = useQueryClient();
  console.log("쿼리클라이언트가 제대로 생성되었나?", query);
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
      alert("함수 실행됨");
      setLiveUser(LiveUser);
    }
  }, [LiveUser]);

  return (
    <div>
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          <div key={user.id}>
            <span>{user.user_email}</span>
            <span>{user.user_nickname}</span>
            {user.avatar_url && (
              <img src={user.avatar_url} alt={`${user.name}'s avatar`} />
            )}
          </div>
        ))
      ) : (
        <span>No users found</span>
      )}
      홈화면의 홈page
      <Button size="sm">click</Button>
    </div>
  );
}
