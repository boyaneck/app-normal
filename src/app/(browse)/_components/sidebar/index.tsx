"use client";
import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
import Recommended from "./recommended";
import FollowingPage from "../../(home)/following/page";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const router = useRouter();
  const onRouterHandler = () => {
    router.push("following");
  };
  return (
    <Wrapper>
      <Toggle />
      <div className="space-y-4 pt-4 lg:pt-0">
        <Recommended />
        <div onClick={onRouterHandler} className="hover cursor-pointer">
          팔로잉
        </div>
      </div>
    </Wrapper>
  );
};

export default Sidebar;
