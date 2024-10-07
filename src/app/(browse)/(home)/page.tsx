"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import Screen from "./_components/screen";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar_store";

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
        "grid transition-all duration-300 ease-in-out bg-yellow-300 ,",
        collapsed ? "ml-[150px] " : " ml-[260px] "
      )}
    >
      <Screen />
      <Button />
    </div>
  );
}
