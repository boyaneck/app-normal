"use client";
import { createViewerToken, getLiveListNow, getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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
  });

  const tokenResults = useQueries({
    queries: (live_list_now ?? []).map((item) => ({
      queryKey: ["top7_viewers_token", item.user_id], // 각 쿼리를 식별할 수 있도록 value(ID)를 키에 포함
      queryFn: () => createViewerToken(item.user_id),
      enabled: !!item.user_id, // ID가 있을 때만 실행
      staleTime: 1000 * 60 * 5, // 5분간 캐싱
    })),
  });

  console.log(
    "토큰은 과연 나왔는가",
    tokenResults.map((item) => {
      item.data;
    })
  );
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out mr-6 pt-6 ",
        collapsed ? "ml-[160px]" : " ml-[210px] "
      )}
    >
      <Main_banner live_list_now={live_list_now} tokenResults={tokenResults} />
      <LiveList />
    </div>
  );
}
