import { animated_heart } from "@/types/chat";
import { useEffect, useState } from "react";

export const AnimatedHeart = ({ onAnimationEnd, id }: animated_heart) => {
  const [is_visible, set_is_visible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      set_is_visible(false);
      onAnimationEnd({ id: id }); // 애니메이션 종료 후 콜백 호출
    }, 800); // 애니메이션 시간과 동일하게 설정

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return is_visible ? (
    <div className="animate-heartWave text--500 text-2xl absolute bottom-0 left-1/2 transform -translate-x-1/2">
      ❤️
    </div>
  ) : null;
};
