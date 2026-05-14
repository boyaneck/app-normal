// "use client";
// import { getHomeTrendingLiveList, getLiveUser } from "@/api";
// import { useViewerToken } from "@/hooks/useViewerToken";
// import { useSidebarStore } from "@/store/bar_store";
// import useUserStore from "@/store/user";
// import { LiveKitRoom } from "@livekit/components-react";
// import { useQuery } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import React, { useEffect, useRef, useState } from "react";
// import { User } from "@/types/user";
// import LiveListVideo from "./live_list_video";

// const LiveList = () => {
//   const [liveuser, setLiveUser] = useState<User[]>([]);
//   const { user } = useUserStore((state) => state);
//   const current_user_email =
//     typeof user?.user_email === "string" ? user?.user_email : "";
//   const current_user_id = user?.user_id !== undefined ? user.user_id : "";
//   const { collapsed } = useSidebarStore();
//   const { data: LiveUser, isLoading } = useQuery({
//     queryKey: ["LiveUser"],
//     queryFn: getLiveUser,
//   });

//   const { data } = useQuery({
//     queryKey: ["homeTrendingLiveList"],
//     queryFn: () => getHomeTrendingLiveList(),
//   });

//   const router = useRouter();
//   const [host_id, setHost_id] = useState("");
//   const [host_nickname, setHost_nickname] = useState<string | undefined>(
//     "유저없음",
//   );

//   const [chkPreviewForToken, setChkPreviewForToken] = useState("");
//   const { token, identity, name } = useViewerToken(host_id);

//   useEffect(() => {
//     if (LiveUser) {
//       setLiveUser(LiveUser);
//     }
//     setChkPreviewForToken(token);
//   }, [LiveUser, token]);

//   if (isLoading) {
//     return <div>데이터 가져오는 중입니다</div>;
//   }

//   const callit = (
//     user_id: string,
//     user_nickname: string | undefined,
//     e: React.MouseEvent<HTMLElement>,
//   ) => {
//     setHost_id(user_id);
//     setHost_nickname(user_nickname);
//   };

//   const onHandlerRouter = (
//     user_id: string,
//     user_nickname: string | undefined,
//   ) => {
//     router.push(
//       `/live/+?host_id=${user_id}&host_nickname=${user_nickname}&host_email=${user_email}`,
//     );
//   };

//   const user_email = user?.user_email === undefined ? "" : user.user_email;

//   return (
//     <div className="grid grid-cols-3 gap-4">
//       {liveuser.length > 0 ? (
//         liveuser.map((user) => (
//           //가장 큰 div
//           <div
//             key={user.id}
//             className={`

//               relative
//               group
//               p-4 rounded-lg shadow-lg
//               transition-all duraion-500 ease-in-out
//               overflow-hidden
//               group-hover:border-gray-500
//                 group-hover:shadow-2xl
//               `}
//             onClick={() => {
//               onHandlerRouter(user.id, user.user_nickname);
//             }}
//           >
//             <div
//               className={`
//                 group
//                 bg-transparent
//                 flex items-center justify-center
//                 h-40 mb-4 rounded-md
//                 transition-all duration-500 ease-in-out
//                 group-hover:scale-y-[1.2]
//                 group-hover:scale-x-[1.2]
//                 group-hover:h-full
//                 group-hover:w-full

//                 `}
//             >
//               {token === chkPreviewForToken && user.id === host_id && (
//                 <>
//                   {/* span 대신 div 사용 */}
//                   {/* 자식 div에 border 지정 */}
//                   <LiveKitRoom
//                     video={true}
//                     audio={true}
//                     token={token}
//                     serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
//                   >
//                     <LiveListVideo />
//                   </LiveKitRoom>
//                 </>
//               )}
//             </div>
//             <div>
//               <div
//                 className={`
//                 flex space-x-3
//                 transition-all duration-500
//                 group-hover:translate-y-full group-hover:opacity-0
//                 group-hover:border-red-500
//                 hover:cursor-pointer

//                 `}
//               >
//                 <img
//                   className="object-cover w-8 h-8 rounded-full"
//                   src="https://plus.unsplash.com/premium_photo-1691095182210-a1b3c46a31d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8"
//                 ></img>
//                 <span>
//                   <div className="font-bold">제목</div>
//                   <div className="">아이디</div>
//                   <span>조회수</span>
//                   <span className="ml-3">년수</span>
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))
//       ) : (
//         <span>No users found</span>
//       )}
//     </div>
//   );
// };

// export default LiveList;

"use client";
import { getHomeTrendingLiveList, getLiveUser } from "@/api";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useSidebarStore } from "@/store/bar-store";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { User } from "@/types/user";
import LiveListVideo from "./live_list_video";

const LiveList = () => {
  const [liveuser, setLiveUser] = useState<User[]>([]);
  const { user } = useUserStore((state) => state);
  const { data: LiveUser, isLoading } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  const router = useRouter();
  const [host_id, setHost_id] = useState("");
  const [chkPreviewForToken, setChkPreviewForToken] = useState("");
  const { token } = useViewerToken(host_id);

  useEffect(() => {
    if (LiveUser) setLiveUser(LiveUser);
    setChkPreviewForToken(token);
  }, [LiveUser, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm tracking-widest text-gray-400 uppercase">
        데이터를 가져오는
      </div>
    );
  }

  const onHandlerRouter = (
    user_id: string,
    user_nickname: string | undefined,
  ) => {
    router.push(`/live/+?host_id=${user_id}&host_nickname=${user_nickname}`);
  };

  return (
    // 전체 배경색이 약간 어두워야(예: bg-[#0a0a0a]) 유리의 투명함과 그림자가 더 잘 보입니다.
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-10">
      {liveuser.length > 0 ? (
        liveuser.map((user) => (
          <div
            key={user.id}
            onMouseEnter={() => setHost_id(user.id)}
            onClick={() => onHandlerRouter(user.id, user.user_nickname)}
            className={`
              relative group cursor-pointer aspect-video rounded-2xl 
              /* 기본 상태: 평면적인 유리창 느낌 */
              bg-white/[0.02] border border-white/10 backdrop-blur-md
              transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
              
              /* 호버 상태: 입체적으로 튀어나오는 효과 */
              hover:z-30                       /* 다른 카드보다 위로 올라오게 */
              hover:-translate-y-4             /* 위로 붕 떠오름 */
              hover:scale-[1.03]               /* 살짝 커짐 */
              hover:border-white/40            /* 테두리가 빛남 */
              hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] /* 깊은 하단 그림자 */
            `}
          >
            {/* 1. 라이브 비디오 레이어 */}
            <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
              {token && user.id === host_id ? (
                <LiveKitRoom
                  video={true}
                  audio={false}
                  token={token}
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                  <LiveListVideo />
                </LiveKitRoom>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-white/5 animate-pulse" />
                </div>
              )}
            </div>

            {/* 2. 유광 레이어 (유리면에 빛이 반사되는 느낌) */}
            <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
            </div>

            {/* 3. 그라데이션 오버레이 (텍스트 보호용) */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-all duration-500" />

            {/* 4. 텍스트 정보 레이어 */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-30 transition-all duration-500 ease-in-out group-hover:translate-y-12 group-hover:opacity-0">
              <div className="flex items-center space-x-5">
                <div className="relative flex-shrink-0">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-white/10 object-cover shadow-xl"
                    src={
                      user.profile_image ||
                      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=100&auto=format&fit=crop"
                    }
                    alt={user.user_nickname}
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-[#1a1a1a]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-xl tracking-tight truncate leading-tight">
                    {user.stream_title || "Premium Live Session"}
                  </h3>
                  <div className="flex items-center text-gray-400 text-sm mt-1.5 space-x-3 tracking-wide">
                    <span className="text-white/70 font-medium">
                      {user.user_nickname}
                    </span>
                    <span className="w-[1px] h-3 bg-white/20" />
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse" />
                      1.2K
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. 가장 바깥쪽 하이라이트 테두리 (애플 감성) */}
            <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-500 z-40" />
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-32 text-gray-600 tracking-[0.2em] font-light uppercase text-sm">
          Awaiting Live Connections...
        </div>
      )}
    </div>
  );
};

export default LiveList;
