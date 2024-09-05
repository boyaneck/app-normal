"use client";
import { supabaseForClient } from "@/supabase/supabase_client";
import Image from "next/image";
import React, { useState } from "react";
const Signin = () => {
  const [arbre, setArbre] = useState("");
  const getGoogleSocialLogin = async () => {
    try {
      await supabaseForClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${url}`,
        },
      });
    } catch (error) {
      // openCustomModalHandler(`goolgleAuthFailed: ${error}`, "alert")
    }
  };

  const getKakaoSocialLogin = async () => {
    try {
      await supabaseForClient.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          // redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}${url}`,
        },
      });
    } catch (error) {
      // openCustomModalHandler(`kakaoAuthFailed: ${error}`, "alert")
    }
  };
  return (
    <div className="flex flex-col border border-black  items-center">
      <div onClick={getGoogleSocialLogin}>
        <Image
          src={"/images/google_logo.png"}
          alt="google_logo"
          width={35}
          height={35}
        ></Image>
      </div>
      <div className="" onClick={getKakaoSocialLogin}>
        <Image
          src={"/images/kakao_logo.png"}
          alt="kakao_logo"
          width={35}
          height={35}
        ></Image>
      </div>
      {/* <div className="">
        <Image
          src={"/images/github_logo.png"}
          alt="github_logo"
          width={35}
          height={35}
        ></Image>
      </div> */}
    </div>
  );
};

export default Signin;
