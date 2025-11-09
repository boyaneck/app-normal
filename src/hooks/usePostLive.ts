import { live_stat_count_props, post_live_stats_props } from "@/types/live";
import { useCallback, useEffect, useMemo, useRef } from "react";

const formatNumber = (
  value: number,
  decimal: number,
  prefix: string,
  suffix: string
) => {
  let formatted;
  if (decimal > 0) {
    formatted = value.toFixed(decimal);
  } else {
    formatted = Math.round(value).toLocaleString("ko-KR");
  }
  return prefix + formatted + suffix;
};
const avgForWeek = (post_live_stats: post_live_stats_props[] | null) => {
  console.log(
    "처음 평균값을 구하기 위해 데이터가 들어온다",
    post_live_stats?.length
  );

  const stat_array = Array.isArray(post_live_stats) ? post_live_stats : [];
  const days_of_live = stat_array.length;

  // 방송 횟수가 0이면 계산 없이 초기값 반환
  if (days_of_live === 0) {
    return {
      avg_viewer: 0,
      peak_viewer: 0,
      into_chat_rate: "0.00",
      fund: 0,
    };
  }

  const initial_sums = {
    avg_viewer_sum: 0,
    peak_viewer_sum: 0,
    into_chat_rate_sum: 0,
    fund_sum: 0,
  };

  console.log("자 여기서 뭐가 나오는지 보자 ", stat_array);
  // reduce를 이용해 모든 지표의 총합 계산 (객체 초기값 필수)
  stat_array;
  const totals = stat_array.reduce((acc, day) => {
    console.log("7일치 계산시 가져와야하는 값,", day);
    // null/undefined 값을 안전하게 0으로 변환하여 합산
    acc.avg_viewer_sum += Number(day?.avg_viewer) || 0;
    acc.peak_viewer_sum += Number(day?.peak_viewer) || 0;
    acc.into_chat_rate_sum += Number(day?.into_chat_rate) || 0;
    acc.fund_sum += Number(day?.fund) || 0;
    return acc;
  }, initial_sums);

  return {
    avg_viewer: Math.round(totals.avg_viewer_sum / days_of_live),
    peak_viewer: Math.round(totals.peak_viewer_sum / days_of_live),
    // 채팅 전환률은 소수점 둘째 자리까지 표시 (문자열 반환)
    into_chat_rate: (totals.into_chat_rate_sum / days_of_live).toFixed(2),
    // 후원 금액은 반올림
    fund: Math.round(totals.fund_sum / days_of_live),
  };
}; // post_live_stats가 변경될 때만 재계산
export const usePostLive = () => {
  const statCardRef = useRef<HTMLDivElement>(null);
  console.log("현재 가지고 있는 card의 ref", statCardRef);
  const animateCount = useCallback(
    ({
      start,
      end,
      prefix,
      suffix,
      duration,
      decimal,
    }: live_stat_count_props) => {
      if (!statCardRef.current) return;
      console.log("현재 statCardRef의 값", statCardRef);
      console.log("쿠쿠루 삥뽕");
      // 이미 진행 중인 애니메이션이 있다면 취소하는 로직이 필요할 수 있습니다.
      // 여기서는 간단히 구현합니다.

      let start_timestamp = 0;
      let animated_frame: number; // requestAnimationFrame의 반환 타입

      const count_rate = (timestamp: number) => {
        if (!start_timestamp) start_timestamp = timestamp;

        const calculate_progress = Math.min(
          (timestamp - start_timestamp) / duration,
          1
        );
        // Easing 함수 적용 (예: Cubic Out)
        const progress = 1 - Math.pow(1 - calculate_progress, 3);
        const current_val = start + progress * (end - start);

        statCardRef.current!.textContent = formatNumber(
          current_val,
          decimal,
          prefix,
          suffix
        );

        if (calculate_progress < 1) {
          animated_frame = window.requestAnimationFrame(count_rate);
        } else {
          // 애니메이션 종료 후 최종 값 설정
          statCardRef.current!.textContent = formatNumber(
            end,
            decimal,
            prefix,
            suffix
          );
        }
      };

      // 이전 애니메이션 취소 및 새로운 애니메이션 시작
      if (statCardRef.current.dataset.animationFrame) {
        window.cancelAnimationFrame(
          Number(statCardRef.current.dataset.animationFrame)
        );
      }
      animated_frame = window.requestAnimationFrame(count_rate);
      statCardRef.current.dataset.animationFrame = String(animated_frame); // ref에 프레임 ID 저장

      // 애니메이션 취소 함수를 반환하여 필요시 cleanup 할 수 있게 합니다.
      return () => {
        window.cancelAnimationFrame(animated_frame);
        delete statCardRef.current?.dataset.animationFrame;
      };
    },
    [] // 의존성 배열은 비워두거나, formatNumber가 외부로 이동했다면 해당 함수를 넣습니다.
  );
  return { avgForWeek, animateCount, statCardRef };
};
