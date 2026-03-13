"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { getFollowingUsers, getFollowingUsersInfo } from "@/api/follow";
import useUserStore from "@/store/user";
import { FaRegHeart } from "react-icons/fa6";
import Image from "next/image";
import useFollowingUserStore from "@/store/following_user";

const Following_user = () => {
  const { user } = useUserStore((state) => state);
  const [follow_user, setFollow_user] = useState<string[] | null>([]);
  const { setFollowingUser } = useFollowingUserStore((state) => state);
  const current_user_email =
    typeof user?.user_email === "string" ? user?.user_email : "";

  const { data: following_users } = useQuery({
    queryKey: ["following_users"],
    queryFn: () => getFollowingUsers(current_user_email),
    enabled: !!current_user_email,
  });

  //현재 following 한 모든 유저(채널)

  const { data: following_users_info } = useQuery({
    queryKey: ["following_users_info"],
    queryFn: async () => {
      if (following_users !== undefined && following_users !== null) {
        console.log("자 확인 ", following_users[0].follow);
        return getFollowingUsersInfo(following_users[0].follow);
      }
    },
    enabled: !!following_users,
  });
  useEffect(() => {
    if (following_users) {
      setFollow_user(following_users);
      setFollowingUser(following_users);
    }
  }, [following_users]);

  console.log("값을 주세요", following_users, following_users_info);
  return (
    <span>
      <>
        <FaRegHeart className="w-8 h-8" />
      </>
    </span>
  );
};

export default Following_user;
