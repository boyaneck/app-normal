"use client";
import { createViewerToken, getLiveListNow, getLiveUser } from "@/api";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import LiveList from "./_components/live_list";
import MainBanner from "./_components/main_banner";
import { useMemo } from "react";

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
      queryFn: async () => {
        const res = await createViewerToken(item.user_id);
        return res;
      },
      enabled: !!item.user_id, // ID가 있을 때만 실행
      staleTime: 1000 * 60 * 5, // 5분간 캐싱
    })),
  });

  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out mr-6 pt-6 ",
        collapsed ? "ml-[160px]" : " ml-[210px] ",
      )}
    >
      <MainBanner live_list_now={live_list_now} tokenResults={tokenResults} />
      <LiveList />
    </div>
  );
}
