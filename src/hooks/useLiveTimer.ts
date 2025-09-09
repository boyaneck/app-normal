import { useEffect, useRef, useState } from "react";
import { live_timer_props } from "@/types/live";

export const useLiveTimer = ({ streaming_timer }: live_timer_props) => {
  // ✅ 1. 타이머 ID와 표시 시간을 훅 내부에서 관리
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [live_time, set_live_time] = useState<string>("00:00");

  useEffect(() => {
    const num = Number(streaming_timer);

    // ✅ 2. 유효성 검사 통합 및 초기화
    if (!streaming_timer || isNaN(num)) {
      console.log("유효하지 않은 시간 데이터입니다.");
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
      set_live_time("00:00");
      return;
    }

    const start_time = new Date(num).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const gap = now - start_time;
      const total_seconds = Math.floor(gap / 1000);
      const minutes = Math.floor(total_seconds / 60);
      const seconds = total_seconds % 60;
      let display_time;

      if (minutes < 1) {
        display_time = `${String(seconds).padStart(2, "0")}초`;
        if (total_seconds >= 60 && timerIdRef.current) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = setInterval(updateTimer, 60000);
        }
      } else if (minutes < 60) {
        // ✅ 3. 분 표시 형식 개선
        display_time = `${String(minutes).padStart(2, "0")}분`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remaining_minutes = minutes % 60;

        // ✅ 4. 1시간 이상일 때 분과 시간을 모두 표시
        display_time = `${String(hours).padStart(2, "0")}시간 ${String(
          remaining_minutes
        ).padStart(2, "0")}분`;

        if (
          remaining_minutes === 0 &&
          total_seconds >= 3600 &&
          timerIdRef.current
        ) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = setInterval(updateTimer, 3600000);
        }
      }

      // ✅ 5. 계산된 값을 상태에 할당
      set_live_time(display_time);
    };

    timerIdRef.current = setInterval(updateTimer, 1000);
    updateTimer();

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [streaming_timer]);

  // ✅ 6. 최종적으로 상태 값을 반환
  return { live_time };
};
