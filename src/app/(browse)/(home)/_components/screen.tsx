"use client";
import { getLiveUser } from "@/api";
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

  return (
    <div className="grid grid-cols-4 gap-2 p-4 transition-all duration-300 ease-in-out">
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          <div key={user.id} className="p-4 bg-white rounded-lg shadow-lg">
            {/* 스크린 컨테이너 */}
            <div className="h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">
                스크린
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
