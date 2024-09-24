"use client";
import { getFollowedUser } from "@/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import useFollowedUserStore from "@/store/followedUsers";

const Recommended = () => {
  const { setUser2, user2 } = useFollowedUserStore((state) => state);
  const { data: followedUsers } = useQuery({
    queryKey: ["followedUsers"],
    queryFn: getFollowedUser,
  });

  useEffect(() => {
    setUser2(followedUsers);
  }, [followedUsers]);
  console.log("팔로우한 유저들", user2);
  return (
    <div>
      {" "}
      {user2 &&
        user2.map((user, index) => (
          <div key={index}>
            <p>{user.user_email}</p>
            <p>{user.name}</p>
          </div>
        ))}
    </div>
  );
};

export default Recommended;
