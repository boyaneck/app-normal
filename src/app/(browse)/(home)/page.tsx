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
