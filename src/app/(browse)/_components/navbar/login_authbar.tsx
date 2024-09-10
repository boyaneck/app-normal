"use client";
import useSigninAndLogout from "@/hooks/useSigninAndLogout";
import Link from "next/link";
import React, { useState } from "react";

interface userIdentifyProps {}

const Login_authbar = () => {
  // const [isIdentified, setIsIdentified] = useState<string>("");
  const { isIdentified } = useSigninAndLogout();
  return (
    <div className="">
      {isIdentified ? (
        <span>회원정보 바</span>
      ) : (
        <span>
          <Link href={"/signin"}>로그인</Link>
        </span>
      )}
    </div>
  );
};

export default Login_authbar;
