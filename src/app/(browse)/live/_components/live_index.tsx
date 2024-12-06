// "use client";
// import Video from "@/app/(browse)/live/_components/video";
// import { useViewrToken } from "@/hooks/useViewerToken";
// import useUserStore from "@/store/user";
// import { LiveKitRoom } from "@livekit/components-react";
// import { cookies } from "next/headers";
// import { Room } from "livekit-client";
// import React from "react";

// interface LivePlayerProps {
//   user: string | userData | null;
//   stream: string;
//   is_following: string[] | null;
//   token: string;
// }

// const LiveIndex = ({ user, stream, is_following, token }: LivePlayerProps) => {
//   const { user: current_user } = useUserStore((state) => state);
//   //현재가 아닌 해당 유저의 id가 와야함
//   // const { token, name, identity } = useViewrToken(current_user?.user_email!);
//   // const { token, name, identity } = useViewrToken(
//   //   "88560f0a-d2bd-47b0-a340-02ac2e3343aa",
//   //   ""
//   // );

//   return (
//     <div>
//       Allowed to watch stream
//       <LiveKitRoom
//         token={token}
//         server_url={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
//       />
//       부모 클래스
//       <Video host_name="" host_identity="" />
//     </div>
//   );
// };

// export default LiveIndex;
