import { Loader } from "lucide-react";
import React from "react";

interface LoadingVideoProps {
  label: string;
}

const LoadingScreen = ({ label }: LoadingVideoProps) => {
  return (
    // 1. aspect-video를 주어 실제 영상이 나올 자리임을 암시합니다.
    <div></div>
  );
};

export default LoadingScreen;
