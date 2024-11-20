"use client";
import React from "react";
import Wrapper from "./wrapper";
import Toggle from "./toggle";
import FollowingPage from "../../(home)/following/page";
import { useRouter } from "next/navigation";
import Following_user from "./follwing_user";
import Recommendation from "./recommendation";

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
        <Following_user />
      </span>
      <Recommendation />
    </Wrapper>
  );
};

export default Sidebar;
