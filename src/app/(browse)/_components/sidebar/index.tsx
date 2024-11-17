"use client";
import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
import FollowingPage from "../../(home)/following/page";
import { useRouter } from "next/navigation";
import Following_user from "./follwing_user";

const Sidebar = () => {
  const router = useRouter();
  const onRouterHandler = () => {
    router.push("following");
  };
  return (
    <Wrapper>
      <Toggle />
      <div className="space-y-4 pt-4 lg:pt-0">
        <Following_user />
        <div onClick={onRouterHandler} className="hover cursor-pointer">
          팔로잉
        </div>
      </div>
    </Wrapper>
  );
};

export default Sidebar;
