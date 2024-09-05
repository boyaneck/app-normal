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
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseForClient.auth.getSession();
      if (session) {
        console.log("세션이 존재합니다:", session?.user?.email);
        // setUser(session.user.email);
      } else {
        console.log("세션이 없습니다:", error);
      }
    };
    checkSession();
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
