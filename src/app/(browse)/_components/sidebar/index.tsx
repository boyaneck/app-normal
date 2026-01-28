"use client";
import React from "react";
import Wrapper from "./wrapper";
import { useRouter } from "next/navigation";
import Following_user from "./follwing_user";
import ToggleButton from "./toggle";
import LoginUserIcon from "./login_user_icon";

const Sidebar = () => {
  const router = useRouter();
  const onRouterHandler = () => {
    router.push("following");
  };
  return (
    <Wrapper>
      <ToggleButton />
      <LoginUserIcon />
      <Following_user />
    </Wrapper>
  );
};

export default Sidebar;
