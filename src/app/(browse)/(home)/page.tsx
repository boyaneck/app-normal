"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function Home() {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const { data: LiveUser, error } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: () => {
      getLiveUser();
    },
  });

  console.log("라이브유저의 정보", LiveUser);
  useEffect(() => {
    if (LiveUser) {
      setLiveUser(LiveUser);
    }
  }, [LiveUser]);
  return (
    <p>
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          <div key={user.id}>
            <p>{user.name}</p>
            <p>{user.email}</p>
            {user.avatarUrl && (
              <img src={user.avatarUrl} alt={`${user.name}'s avatar`} />
            )}
          </div>
        ))
      ) : (
        <p>No users found</p>
      )}
      홈화면의 홈page
      <Button size="sm">click</Button>
    </p>
  );
}
