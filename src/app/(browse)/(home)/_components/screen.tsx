"use client";
import { getLiveUser } from "@/api";
import { toggleFollow } from "@/api/follow";
import { Button } from "@/components/ui/button";
import useFollow from "@/hooks/useFollow";
import { useScreen } from "@/hooks/useScreen";
import { cn } from "@/lib/utils";
import useFollowedUserStore from "@/store/following_user";
import { useSidebarStore } from "@/store/sidebar_store";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Video from "../../live/_components/video";
import { LiveKitRoom } from "@livekit/components-react";
import { useViewrToken } from "@/hooks/useViewerToken";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}
const Screen = () => {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const router = useRouter();
  const { user } = useUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";
  const { collapsed } = useSidebarStore();
  const { followMutation } = useFollow();
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{ [userId: string]: string | null }>({});

  const {
    data: LiveUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  useEffect(() => {
    if (LiveUser) {
      setLiveUser(LiveUser);
    }
  }, [LiveUser]);

  if (isLoading) {
    return <div>데이터 가져오는 중입니다</div>;
  }

  const callit = async (user_id: string, user_nickname: string | undefined) => {
    const { token } = useViewrToken(
      user?.user_id,
      user?.user_nickname,
      user_id
    );

    setTokens((prev) => ({
      ...prev,
      [user_id]: token,
    }));
  };
  const onHandlerRouter = (
    user_id: string,
    user_nickname: string | undefined
  ) => {
    router.push(`/live/+?user_id=${user_id}&user_nickname=${user_nickname}`);
  };

  // const {} = useScreen();

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
          <div
            key={user.id}
            className="p-4 bg-white rounded-lg shadow-lg"
            onClick={() => {
              onHandlerRouter(user.id, user.user_nickname);
              alert(user.user_nickname);
            }}
            onMouseOver={(e) => {
              setHoveredUserId(user.id);
              setTimeout(() => {
                callit(user.id, user.user_nickname);
              }, 1000);
            }}
            onMouseOut={() => setHoveredUserId(null)}
          >
            {/* 스크린 컨테이너 */}
            <div className="h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">
                <Button
                  onClick={() => {
                    follow(user.user_email, user.id);
                  }}
                  className="border border-red-500"
                />
                {user.user_nickname}
              </span>
              {hoveredUserId === user.id && tokens[user.id] && (
                <LiveKitRoom
                  video={true}
                  audio={true}
                  token={tokens[user.id]}
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                  // room={room}
                  className="border border-purple-500 grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3
                                        xl:grid-cols-3 2xl:grid-cols-6 h-full"
                >
                  <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar">
                    <Video
                      host_name={user.user_nickname}
                      host_identity={user.id}
                      token={tokens[user.id]}
                    />
                  </div>
                </LiveKitRoom>
              )}
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
