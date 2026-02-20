import { WifiOff } from "lucide-react";

import React from "react";
import { FaPenNib } from "react-icons/fa6";

interface OfflineVideoProps {
  user_name: string | undefined;
}

const Offline_Video = ({ user_name }: OfflineVideoProps) => {
  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* 스켈레톤 배경 애니메이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* 빛나는 효과 */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
          style={{ backgroundSize: "200% 100%" }}
        />
      </div>

      {/* 중앙 로딩 표시 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* 펄스 동그라미 */}
        <div className="flex gap-2">
          <div
            className="h-3 w-3 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="h-3 w-3 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-3 w-3 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>

        {/* 로딩 텍스트 */}
        <p className="text-white/60 text-sm animate-pulse">로딩 중...</p>
      </div>
    </div>
  );
};

export default Offline_Video;
