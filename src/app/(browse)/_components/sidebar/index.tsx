"use client";
import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
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
      <span
        onClick={onRouterHandler}
        className="hover cursor-pointer border border-black"
      >
        팔로우 유저
        <Following_user />
        팔로우 유저컴포넌트
      </span>
    </Wrapper>
  );
};

export default Sidebar;
