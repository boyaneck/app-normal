"use client";
import { getLiveListNow } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar-store";
import MainBanner from "./_components/main-banner";
import LiveList from "./_components/live-list";

export default function Home() {
  const { data: live_list_now } = useQuery({
    queryKey: ["live_list"],
    queryFn: getLiveListNow,
    // 새 방송/시청자 순위 변화를 반영하기 위해 주기적으로 다시 불러온다
    refetchInterval: 15 * 1000,
  });

  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out mr-6 pt-6",
        collapsed ? "ml-[160px]" : "ml-[210px]",
      )}
    >
      <MainBanner live_list_now={live_list_now} />
      <LiveList />
    </div>
  );
}
