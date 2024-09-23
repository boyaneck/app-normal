"use client";
import useSigninAndLogout from "@/hooks/useSigninAndLogout";
import Link from "next/link";
import React, { useState } from "react";

interface userIdentifyProps {}

const Login_authbar = () => {
  // const [isIdentified, setIsIdentified] = useState<string>("");
  const [LoginTooltipVisible, setLoginTooltipVisible] =
    useState<boolean>(false);
  const { isIdentified } = useSigninAndLogout();
  console.log("회원로그인 유무 확인하기", isIdentified);
  return (
    <>
      <div className="relative border border-red-500">
        {isIdentified ? (
          <span
            onClick={() => {
              setLoginTooltipVisible(true);
            }}
            className=" cursor-pointer hover:opacity-50 transition-opacity border border-black"
          >
            회원정보 바
            {LoginTooltipVisible && (
              <div className="absolute right-0 mt-2 w-48 bg-white p-4 rounded-lg shadow-lg">
                <div className="p-2 bg-gray-100 hover:shadow-lg transition-shadow hover:shadow-gray-500/50">
                  옵션 1
                </div>
                <div className="p-2 mt-2 bg-gray-100 hover:shadow-lg transition-shadow hover:shadow-gray-500/50">
                  옵션 2
                </div>
                <div className="p-2 mt-2 bg-gray-100 hover:shadow-lg transition-shadow hover:shadow-gray-500/50">
                  옵션 3
                </div>
              </div>
            )}
          </span>
        ) : (
          <span>
            <Link href={"/signin"}>로그인</Link>
          </span>
        )}
      </div>
      <span>Another one</span>
    </>
  );
};

export default Login_authbar;
