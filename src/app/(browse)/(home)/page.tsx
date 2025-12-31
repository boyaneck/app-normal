"use client";
import { getLiveListNow, getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import Screen from "./_components/live_list";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import Main_banner from "./_components/main_banner";
import LiveList from "./_components/live_list";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}

export default function Home() {
  const { data: live_list_now } = useQuery({
    queryKey: ["live_list"],
    queryFn: getLiveListNow,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });
  console.log("메인베너에 들어갈 시청자가 가장많은 7개의 방송", live_list_now);
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out mr-6 pt-6 ",
        collapsed ? "ml-[160px]" : " ml-[210px] "
      )}
    >
      <Main_banner live_list_now={live_list_now} />
      <LiveList />
    </div>
  );
}
