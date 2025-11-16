import { createIngress, getLiveUser } from "@/api";
import useUserStore from "@/store/user";
import { LiveKitRoom } from "@livekit/components-react";
import React, { useEffect, useState } from "react";
import Video from "../../live/_components/video";
import { useViewerToken } from "@/hooks/useViewerToken";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";
import {
  LIVE_STREAMS,
  MAIN_BANNER_SLIDE_DURATION,
  MAIN_BANNER_VIDEO_DURATION,
  UPCOMING_VIDEOS,
} from "@/utils/main_banner";

const Main_banner = () => {
  const [live_user, set_live_user] = useState<User[]>([]);
  const [curr_idx, set_curr_idx] = useState<number>(0);
  const [slider_stop, set_slider_stop] = useState<number>(0);
  const [video_time, set_video_time] = useState<number | undefined>(0);
  const [video_play, set_video_play] = useState<boolean>(true);
  const [control_visible, set_control_visible] = useState<boolean>(false);
  const formatTime = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };
  const SLIDER_ITEMS = [...LIVE_STREAMS, ...UPCOMING_VIDEOS];
  const curr_items = SLIDER_ITEMS[curr_idx];
  const all_items = SLIDER_ITEMS.length;
  const { user } = useUserStore((state) => state);
  const {
    data: LiveUser,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["LiveUser"],
    queryFn: getLiveUser,
  });

  const { token } = useViewerToken("Guest");

  //미리 보기 라이브 영상 2초로 설정,2초마다 슬라이드 됨
  useEffect(() => {
    if (slider_stop || !video_time) return;

    const timeout = setTimeout(() => {
      set_curr_idx((prev) => (prev + 1) % all_items);
    }, MAIN_BANNER_SLIDE_DURATION);

    return () => clearTimeout(timeout);
  }, [curr_idx, slider_stop, video_time, all_items]);

  useEffect(() => {
    if (video_time || curr_items.is_live) {
      set_video_time(0);
      return;
    }
    const interval = setInterval(() => {
      set_video_time((prev) => {
        if (prev !== undefined) {
          const next_time = prev + 1;
          if (next_time >= MAIN_BANNER_VIDEO_DURATION) {
            return 0;
          }
        }
      });
    }, 1000);
  }, [video_play, curr_idx, curr_items.is_live]);

  const handle_silde_click = (idx: number) => {};

  return (
    <div className="h-[500px] border border-green-500">
      {/* {token && (
      \
      
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          // room={room}
          className="border border-purple-500 grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3
          xl:grid-cols-3 2xl:grid-cols-6 h-full"
        >
          <div className="space-y-4 col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar">
            <Video
              host_name={current_host_nickname}
              host_identity={current_host_id}
              token={token}
            />
          </div>
        </LiveKitRoom>
      )} */}
    </div>
  );
};

export default Main_banner;
