import { Loader } from "lucide-react";
import React from "react";

interface LoadingVideoProps {
  label: string;
}

const LoadingScreen = ({ label }: LoadingVideoProps) => {
  return (
    <div className="relative w-full aspect-video bg-[#0f0f0f] rounded-xl overflow-hidden flex flex-col p-5">
      <div className="relative flex-[4] bg-zinc-800/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      </div>

      <div className="absolute top-8 right-8 w-12 h-5 bg-zinc-800/60 rounded-sm animate-pulse" />
    </div>
  );
};

export default LoadingScreen;
