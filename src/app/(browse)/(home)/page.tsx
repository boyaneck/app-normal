"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import Screen from "./_components/screen";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/bar_store";
import Main_banner from "./_components/main_banner";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}

export default function Home() {
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out bg-grey-50 ,",
        collapsed ? "ml-[150px] " : " ml-[260px] "
      )}
    >
      <Main_banner />
      <Screen />
      <Button />
    </div>
  );
}
