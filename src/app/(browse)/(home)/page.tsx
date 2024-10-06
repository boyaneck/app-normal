"use client";
import { getLiveUser } from "@/api";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import Screen from "./_components/screen";

interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}

export default function Home() {
  return (
    <div className="bg-yellow-300 z-50">
      <Screen />
      <Button />
    </div>
  );
}
