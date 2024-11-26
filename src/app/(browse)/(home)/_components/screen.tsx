"use client";
import { getLiveUser } from "@/api";
import { toggleFollow } from "@/api/follow";
import { Button } from "@/components/ui/button";
import useFollow from "@/hooks/useFollow";
import { cn } from "@/lib/utils";
import useFollowedUserStore from "@/store/following_user";
import { useSidebarStore } from "@/store/sidebar_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}
const Screen = () => {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const { user } = useUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";
  const { collapsed } = useSidebarStore();
  const { followMutation } = useFollow();
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
    return <div>데이터 가져오는 중입니다</div>;
  }

  const user_email = user?.user_email === undefined ? "" : user.user_email;
  const follow = (target_user_email: string, user_id: string) => {
    followMutation.mutate({
      current_user_email: user_email,
      target_user_email,
      user_id,
    });
    alert("팔로우가 되었습니다");
  };
  return (
    <div className="grid grid-cols-4 gap-2">
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          <div key={user.id} className="p-4 bg-white rounded-lg shadow-lg">
            {/* 스크린 컨테이너 */}
            <div className="h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">
                <Button
                  onClick={() => {
                    follow(user.user_email, user.id);
                  }}
                />
                스크린!!
              </span>
            </div>

            {/* 아바타와 제목이 왼쪽 정렬 */}
            <div className="flex flex-col items-start">
              <div className="flex items-center mb-2">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={`${user.name}'s avatar`}
                    className="w-12 h-12 rounded-full mr-2"
                  />
                )}
                <h3 className="text-lg font-semibold">{user.user_nickname}</h3>
              </div>

              {/* 이메일 */}
              <span className="text-sm text-gray-600 mb-1">
                {user.user_email}
              </span>

              {/* 카테고리 */}
              <span className="text-xs text-gray-500">카테고리: {"없음"}</span>
            </div>
          </div>
        ))
      ) : (
        <span>No users found</span>
      )}
    </div>
  );
};

export default Screen;
