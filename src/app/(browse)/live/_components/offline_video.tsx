import { WifiOff } from "lucide-react";

import React from "react";
import { FaPenNib } from "react-icons/fa6";

interface OfflineVideoProps {
  user_name: string | undefined;
}

const Offline_Video = ({ user_name }: OfflineVideoProps) => {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center">
      <WifiOff className="w-10 h-10 text-white" />

      <p className="text-white mt-3">연결이 끊어졌습니다</p>
    </div>
  );
};

export default Offline_Video;
