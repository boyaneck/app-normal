import { Loader } from "lucide-react";

import React from "react";

interface LoadingVideoProps {
  label: string;
}

const Loading_Video = ({ label }: LoadingVideoProps) => {
  return (
    <div className="h-full flex flex-col space-y-4 justify-center items-center">
      <Loader className="h-10 w-10 text-muted-foreground animate-spin" />
      <p className="text-muted">{label} is Loading...</p>
      Loading_Video
    </div>
  );
};

export default Loading_Video;
