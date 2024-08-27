"use client";
import { supabaseForClient } from "@/supabase/supabase_client";
import Image from "next/image";
import React from "react";

const Signin = () => {
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
      <div>깃허브 로그인</div>
      <div> 로그인</div>
    </div>
  );
};

export default Signin;
