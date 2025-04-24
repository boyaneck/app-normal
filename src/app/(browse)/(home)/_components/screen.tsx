"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import useFollow from "@/hooks/useFollow";
import { useViewrToken } from "@/hooks/useViewerToken";
import { useSidebarStore } from "@/store/sidebar_store";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Video from "../../live/_components/video";
import { User } from "@/types/user";

const Screen = () => {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const { user } = useUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";
  const current_user_id = user?.user_id !== undefined ? user.user_id : "";
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

  const router = useRouter();
  const [host_id, setHost_id] = useState("");
  const [host_nickname, setHost_nickname] = useState<string | undefined>(
    "유저없음"
  );

  const [chkPreviewForToken, setChkPreviewForToken] = useState("");
  const { token, identity, name } = useViewrToken(
    user?.user_id,
    user?.user_nickname,
    host_id
  );

  useEffect(() => {
    if (LiveUser) {
      setLiveUser(LiveUser);
    }
    setChkPreviewForToken(token);
  }, [LiveUser, token]);

  if (isLoading) {
    return <div>데이터 가져오는 중입니다</div>;
  }

  const callit = (
    user_id: string,
    user_nickname: string | undefined,
    e: React.MouseEvent<HTMLElement>
  ) => {
    setHost_id(user_id);
    setHost_nickname(user_nickname);
  };

  const onHandlerRouter = (
    user_id: string,
    user_nickname: string | undefined
  ) => {
    router.push(
      `/live/+?host_id=${user_id}&host_nickname=${user_nickname}&host_email=${user_email}`
    );
  };

  const user_email = user?.user_email === undefined ? "" : user.user_email;
  const follow = (target_user_email: string, target_user_id: string) => {
    followMutation.mutate({
      current_user_email: user_email,
      current_user_id,
      target_user_email,
      target_user_id,
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
          >
            {/* 스크린 컨테이너 */}
            <div
              className="relative h-40 mb-4 rounded-md flex items-center justify-center"
              onClick={() => {
                follow(user.user_email, user.id);
              }}
              onMouseEnter={(e) => {
                setTimeout(() => {
                  callit(user.id, user.user_nickname, e);
                }, 1000);
              }}
              onMouseLeave={() => {
                setHost_id("");
                setHost_nickname("");
                setChkPreviewForToken("");
                alert("마우스 때기 ");
              }}
            >
              {token === chkPreviewForToken && user.id === host_id && (
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* span 대신 div 사용 */}
                  <div className="absolute top-0 left-0 w-full h-full border border-red-400">
                    {/* 자식 div에 border 지정 */}
                    <LiveKitRoom
                      video={true}
                      audio={true}
                      token={token}
                      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                    >
                      <Video
                        host_name={host_nickname}
                        host_identity={host_id}
                        token={chkPreviewForToken}
                      />
                    </LiveKitRoom>
                  </div>
                </div>
              )}
              <span className="absolute top-0 left-0 text-xl font-semibold text-gray-700 border border-red-500">
                aaa
              </span>
            </div>
            <div className="border border-green-400">제목</div>

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
