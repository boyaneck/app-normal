import { Loader } from "lucide-react";
import React from "react";

interface LoadingVideoProps {
  label: string;
}

// LiveKit ConnectionState 값 → 실제 상황에 맞는 문구
const STATE_LABELS: Record<string, string> = {
  connecting: "연결 중...",
  reconnecting: "재연결 중...",
  signalReconnecting: "재연결 중...",
  disconnected: "연결이 끊어졌습니다",
};

const LoadingScreen = ({ label }: LoadingVideoProps) => {
  const displayLabel = STATE_LABELS[label] ?? "연결 중...";

  return (
    <div className="relative h-full w-full bg-[#0f0f0f] rounded-xl overflow-hidden flex flex-col p-5">
      <div className="relative flex-[4] bg-zinc-800/30 rounded-lg overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">{displayLabel}</p>
        </div>
      </div>

      <div className="absolute top-8 right-8 w-12 h-5 bg-zinc-800/60 rounded-sm animate-pulse" />
    </div>
  );
};

export default LoadingScreen;
