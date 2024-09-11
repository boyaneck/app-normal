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
    <div>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        {children}
      </QueryClientProvider>
      Layout
    </div>
  );
};

export default Layout;
