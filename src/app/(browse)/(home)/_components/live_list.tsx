"use client";
import { getLiveUser } from "@/api";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useSidebarStore } from "@/store/bar_store";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { User } from "@/types/user";
import LiveListVideo from "./live_list_video";

const LiveList = () => {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const { user } = useUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";
  const current_user_id = user?.user_id !== undefined ? user.user_id : "";
  const { collapsed } = useSidebarStore();
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
    "유저없음",
  );

  const [chkPreviewForToken, setChkPreviewForToken] = useState("");
  const { token, identity, name } = useViewerToken(host_id);

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
    e: React.MouseEvent<HTMLElement>,
  ) => {
    setHost_id(user_id);
    setHost_nickname(user_nickname);
  };

  const onHandlerRouter = (
    user_id: string,
    user_nickname: string | undefined,
  ) => {
    router.push(
      `/live/+?host_id=${user_id}&host_nickname=${user_nickname}&host_email=${user_email}`,
    );
  };

  const user_email = user?.user_email === undefined ? "" : user.user_email;
  // const follow = (target_user_email: string, target_user_id: string) => {
  //   followMutation.mutate({
  //     current_user_email: user_email,
  //     current_user_id,
  //     target_user_email,
  //     target_user_id,
  //   });
  //   alert("팔로우가 되었습니다");
  // };

  return (
    <div className="grid grid-cols-3 gap-4">
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          //가장 큰 div
          <div
            key={user.id}
            className={`
             
              relative 
              group 
              p-4 rounded-lg shadow-lg 
              transition-all duraion-500 ease-in-out
              overflow-hidden
              group-hover:border-gray-500
                group-hover:shadow-2xl
              `}
            onClick={() => {
              onHandlerRouter(user.id, user.user_nickname);
            }}
          >
            <div
              className={`
                group
                bg-transparent
                flex items-center justify-center
                h-40 mb-4 rounded-md
                transition-all duration-500 ease-in-out
                group-hover:scale-y-[1.2]
                group-hover:scale-x-[1.2]
                group-hover:h-full
                group-hover:w-full
                
                `}
            >
              {token === chkPreviewForToken && user.id === host_id && (
                <>
                  {/* span 대신 div 사용 */}
                  {/* 자식 div에 border 지정 */}
                  <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                  >
                    <LiveListVideo />
                  </LiveKitRoom>
                </>
              )}
            </div>
            <div>
              <div
                className={`
                flex space-x-3
                transition-all duration-500 
                group-hover:translate-y-full group-hover:opacity-0
                group-hover:border-red-500
                hover:cursor-pointer
                
                `}
              >
                <img
                  className="object-cover w-8 h-8 rounded-full"
                  src="https://plus.unsplash.com/premium_photo-1691095182210-a1b3c46a31d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8"
                ></img>
                <span>
                  <div className="font-bold">제목</div>
                  <div className="">아이디</div>
                  <span>조회수</span>
                  <span className="ml-3">년수</span>
                </span>
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

export default LiveList;
