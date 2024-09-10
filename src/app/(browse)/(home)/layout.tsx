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

  return (
    <div>
      <Navbar />
      {children}
      Layout
    </div>
  );
};

export default Layout;
