import { live_stat_count_props } from "@/types/live";
import { useEffect, useMemo, useRef } from "react";

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
export const usePostLive = ({
  post_live_stats,
  ref,
  start,
  end,
  prefix,
  suffix,
  duration,
  decimal,
}: live_stat_count_props) => {
  const avg_for_week = useMemo(() => {
    const stat_array = Array.isArray(post_live_stats) ? post_live_stats : [];
    const live_count = stat_array.length;

    // 방송 횟수가 0이면 계산 없이 초기값 반환
    if (live_count === 0) {
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

    // reduce를 이용해 모든 지표의 총합 계산 (객체 초기값 필수)
    const totals = stat_array.reduce((acc, dayStat) => {
      // null/undefined 값을 안전하게 0으로 변환하여 합산
      acc.avg_viewer_sum += Number(dayStat.avg_viewer) || 0;
      acc.peak_viewer_sum += Number(dayStat.peak_viewer) || 0;
      acc.into_chat_rate_sum += Number(dayStat.into_chat_rate) || 0;
      acc.fund_sum += Number(dayStat.fund) || 0;
      return acc;
    }, initial_sums);

    return {
      avg_viewer: Math.round(totals.avg_viewer_sum / live_count),
      peak_viewer: Math.round(totals.peak_viewer_sum / live_count),
      // 채팅 전환률은 소수점 둘째 자리까지 표시 (문자열 반환)
      into_chat_rate: (totals.into_chat_rate_sum / live_count).toFixed(2),
      // 후원 금액은 반올림
      fund: Math.round(totals.fund_sum / live_count),
    };
  }, [post_live_stats]); // post_live_stats가 변경될 때만 재계산

  // return {
  //   post_live_stats, // 원본 데이터
  //   avg_for_week, // 새로 계산된 평균 데이터
  // };
  useEffect(() => {
    if (!ref.current) return;
    if (start === end || isNaN(start) || isNaN(end)) {
      ref.current.textContent = formatNumber(end, decimal, prefix, suffix);
      return;
    }

    let start_timestamp = 0;
    let animated_frame: any;

    const count_rate = (timestamp: number) => {
      if (!start_timestamp) start_timestamp = timestamp;

      const calculate_progress = Math.min(
        (timestamp - start_timestamp) / duration,
        1
      );
      const progress = 1 - Math.pow(1 - calculate_progress, 3);
      const current_val = start + progress * (end - start);
      ref.current!.textContent = formatNumber(
        current_val,
        decimal,
        prefix,
        suffix
      );
      if (calculate_progress < 1) {
        animated_frame = window.requestAnimationFrame(count_rate);
      } else {
        ref.current!.textContent = formatNumber(end, decimal, prefix, suffix);
      }
    };
    animated_frame = window.requestAnimationFrame(count_rate);

    return () => {
      window.cancelAnimationFrame(animated_frame);
    };
  }, [ref, start, end, prefix, suffix, duration, decimal]);
};
