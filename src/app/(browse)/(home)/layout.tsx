"use client";
import React, { useEffect } from "react";
import Navbar from "../_components/navbar";
import { supabaseForClient } from "@/supabase/supabase_client";
import useUserStore from "@/store/user";

interface childrenProps {
  children: React.ReactNode;
}
const Layout = ({ children }: childrenProps) => {
  const { setUser } = useUserStore((state) => state);

  useEffect(() => {
    const loginSubscription = supabaseForClient.auth.onAuthStateChange(
      (event, session) => {
        console.log("그 세션 췤!!!!!!", session);
        if (session) {
          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          }
        } else {
          console.log("세션 없음 췤!!!!ㅣ.", session);
        }
      }
    );
    // const checkSession = async () => {
    //   const {
    //     data: { session },
    //     error,
    //   } = await supabaseForClient.auth.getSession();
    //   if (session) {
    //     console.log("세션이 존재합니다:", session?.user?.email);
    //     console.log("처음 로그인 인지 아닌지 유무 ", session);
    //     // setUser(session.user.email);
    //   } else {
    //     console.log("세션이 없습니다:", error);
    //   }
    // };
    // checkSession();
    return () => {
      loginSubscription.data.subscription.unsubscribe();
    };
  }, []);
  return (
    <div>
      <Navbar />
      {children}
      Layout
    </div>
  );
};

export default Layout;
