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

  // reduce를 이용해 모든 지표의 총합 계산 (객체 초기값 필수)
  stat_array;
  const totals = stat_array.reduce((acc, day) => {
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
    into_chat_rate: (totals.into_chat_rate_sum / days_of_live).toFixed(2),
    fund: Math.round(totals.fund_sum / days_of_live),
  };
};

type ref_store = Record<string, HTMLDivElement | null>;
type store = Record<string, HTMLDivElement | null>;
interface props {
  payload: post_live_stats_props;
  // ref: string | undefined;
  ref: ref_store | null | undefined;
}
export const usePostLive = () => {
  // const animateCount = ({
  //   post_live_stats,
  //   start,
  //   end,
  //   prefix,
  //   suffix,
  //   duration,
  //   decimal,

  //PAYLOAD는 현재 그래프의 CURSOR 가 가르키는 날짜의 VALUE
  //ref는 현재 각가의 카드의 div
  const animateCount = (post_live_obj: props) => {
    console.log("데이터 확인하기", post_live_obj?.payload);
    console.log(
      "ref데이터들 각각 다 끄집어 내기 ",
      post_live_obj?.ref?.peak_viewer?.textContent
    );
    if (!post_live_obj?.ref) return;
    //현재 card의 데이터들
    const before_avg_viewer = post_live_obj.ref?.avg_viewer?.textContent;
    const before_fund = post_live_obj.ref?.fund?.textContent;
    const before_chat_rate = post_live_obj?.ref.into_chat_rate?.textContent;
    const before_peak_viewer = post_live_obj?.ref.peak_viewer?.textContent;
    const duration = 1000;

    const after_avg_viewer = post_live_obj.payload?.avg_viewer;
    const after_fund = post_live_obj?.payload?.fund;
    const after_chat_rate = post_live_obj?.payload.into_chat_rate;
    const after_peak_viewer = post_live_obj?.payload.peak_viewer;

    //바뀌어야 할 데이터들

    // const ref_element = post_live_obj?.ref;/
    const start_value = Number(post_live_obj?.ref) || 0;
    const end_value = Number();
    if (start_value === end_value) return;
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

      // 🚀 현재 값 계산: 시작 값 + 진행률 * (목표 값 - 시작 값)
      const current_value = start_value + progress * (end_value - start_value);

      // 🚀 DOM 업데이트 (단위 처리 필요)
      // 현재는 fund이므로 '원' 단위를 가정합니다.
      const formatted_value = Math.floor(current_value).toLocaleString() + "원";
      ref_element = formatted_value;

      // 🚀 애니메이션 지속 조건 체크
      if (calculate_progress < 1) {
        // 진행 중: 다음 프레임 요청
        animated_frame = window.requestAnimationFrame(count_rate);
      } else {
        // 완료: 최종 값으로 설정하고 종료
        ref_element = end_value.toLocaleString() + "원";
      }
    };

    // 💡 4. 애니메이션 루프 시작
    window.requestAnimationFrame(count_rate);
  };
  return { avgForWeek, animateCount };
};
