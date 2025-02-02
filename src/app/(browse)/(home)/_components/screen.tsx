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
    alert("그럼 뜨냐 ???");
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
    console.log("뿡밧풍커리", user_id, user_nickname);
    setHost_id(user_id);
    setHost_nickname(user_nickname);
  };

  const onHandlerRouter = (
    user_id: string,
    user_nickname: string | undefined
  ) => {
    router.push(`/live/+?user_id=${user_id}&user_nickname=${user_nickname}`);
  };

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
          >
            <div className="border border-green-400">이 div 엘리먼트 참조</div>
            {/* 스크린 컨테이너 */}
            <div className="h-40 bg-gray-200 mb-4 rounded-md flex items-center justify-center">
              <span className="text-xl font-semibold text-gray-700">
                <div className="border border-red-500"></div>
                <Button
                  onClick={() => {
                    follow(user.user_email, user.id);
                  }}
                  onMouseEnter={(e) => {
                    setTimeout(() => {
                      callit(user.id, user.user_nickname, e);
                      // useee.current = {
                      //   ...useee.current,
                      //   id: user.id,
                      // };
                    }, 1000);
                  }}
                  onMouseOut={() => {
                    // setHost_id("");
                    // setHost_nickname("");
                    // setChkPreviewForToken("");
                    // alert("마우스 때기 ");
                  }}
                  className="border border-red-500"
                />
                <div className="border border-green-400"></div>
                스크린!!
                {token === chkPreviewForToken && user.id === host_id && (
                  <span className="border border-red-400 w-[200px]">
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
                  </span>
                )}
                {user.user_nickname}
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
