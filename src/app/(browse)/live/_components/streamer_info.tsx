import useFollow from "@/hooks/useFollow";
import useUserStore from "@/store/user";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface live_info {
  category: string | null;
  id: string;
  ingress_id: string;
  is_live: boolean;
  server_url: string;
  stream_key: string;
  title: string;
  user_email: string;
  user_id: string;
  visitor: number;
}
interface streamer_info_props {
  live_information: live_info | undefined;
  current_host_id: string | undefined;
  current_host_email: string | undefined;
}

const StreamerInfo = ({
  live_information,
  current_host_id,
  current_host_email,
}: streamer_info_props) => {
  const { followMutation } = useFollow();

  const { user, setUser } = useUserStore();
  const current_user_email =
    user?.user_email !== undefined ? user.user_email : "";
  const host_email = current_host_email !== undefined ? current_host_email : "";
  const host_id = current_host_id !== undefined ? current_host_id : "";
  const current_user_id = user?.user_id !== undefined ? user.user_id : "";
  const live_info = live_information;
  console.log(typeof live_information);

  const toggleFollow = () => {
    followMutation.mutate({
      current_user_email,
      target_user_email: host_email,
      target_user_id: host_id,
      current_user_id,
    });
    alert("팔로우완료");
  };

  return (
    <div>
      {/* 카테고리 {live_info?.category} */}
      <span>타이틀:{live_info?.title}</span>
      유저 아바타(생방송정보),팔로워, 팔로우 버튼,신고하기, 현재 시청중인 시청자
      수 , 해당 방송 경과시간,후원하기 버튼 {}
      <span onClick={() => toggleFollow()} className="border border-red-800">
        팔로우 버튼
      </span>
    </div>
  );
};

export default StreamerInfo;
