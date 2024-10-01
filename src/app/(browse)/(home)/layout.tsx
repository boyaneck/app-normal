"use client";
import React, { useEffect } from "react";
import Navbar from "../_components/navbar";
import { supabaseForClient } from "@/supabase/supabase_client";
import useUserStore from "@/store/user";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface childrenProps {
  children: React.ReactNode;
}
const Layout = ({ children }: childrenProps) => {
  const { setUser } = useUserStore((state) => state);
  const queryClient = new QueryClient();
  return (
    <div className="border border-blue-500">
      <QueryClientProvider client={queryClient}>
        <Navbar />
        {children}
      </QueryClientProvider>
      홈화면의 라이브중인 사람들의 목록 Layout
    </div>
  );
};

export default Layout;
