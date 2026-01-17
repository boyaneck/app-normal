"use client";
import React from "react";
import Wrapper from "./wrapper";
import { useRouter } from "next/navigation";
import Following_user from "./follwing_user";
import ToggleButton from "./toggle";

const Sidebar = () => {
  const router = useRouter();
  const onRouterHandler = () => {
    router.push("following");
  };
  return (
    <Wrapper>
      <ToggleButton />
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
