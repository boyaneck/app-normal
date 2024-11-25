import { WifiOff } from "lucide-react";

import React from "react";

interface OfflineVideoProps {
  user_name: string;
}

const Offline_Video = ({ user_name }: OfflineVideoProps) => {
  return (
    <div className="h-full flex flex-col space-y-4 justify-center items-center">
      <WifiOff className="h-10 w-10 text-muted-foreground" />
      <p className="text-muted">{user_name} is Offline</p>
      Offline_Video
    </div>
  );
};

export default Offline_Video;
