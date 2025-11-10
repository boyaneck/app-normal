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

interface props {
  payload: post_live_stats_props;
  ref: string | undefined;
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

  // const animateCount = (post_live_obj: props) => {
  //   console.log("데이터 확인하기", post_live_obj);

  //   if (!post_live_obj?.ref) return;
  //   const avg_view = post_live_obj.payload?.avg_viewer;
  //   const fund = post_live_obj.payload?.fund;
  //   const chat_rate = post_live_obj?.payload.into_chat_rate;
  //   const peak_viewer = post_live_obj?.payload.peak_viewer;
  //   const duration = 1000;

  //   //ref의 경우 가장 마지막 값인 fund 의 stat_card의 ref를 가져옴
  //   //그래서 fund 의 값 차이를 통해 animation 실행 유무를 비교해야함
  //   const ref_element=post_live_obj?.ref
  //   const start_value = Number(post_live_obj?.ref) || 0;
  //   const end_value = Number(fund);
  //   console.log("현재의 current ref 의 값", start_value);
  //   if(start_value === end_value) return
  //   let start_timestamp = 0;
  //   let animated_frame: number; // requestAnimationFrame의 반환 타입
  //   const count_rate = (timestamp: number) => {
  //       if (!start_timestamp) start_timestamp = timestamp;

  //       const calculate_progress = Math.min(
  //           (timestamp - start_timestamp) / duration,
  //           1
  //       );

  //       // Easing 함수 적용 (예: Cubic Out)
  //       const progress = 1 - Math.pow(1 - calculate_progress, 3);

  //       // 🚀 현재 값 계산: 시작 값 + 진행률 * (목표 값 - 시작 값)
  //       const current_value = start_value + progress * (end_value - start_value);

  //       // 🚀 DOM 업데이트 (단위 처리 필요)
  //       // 현재는 fund이므로 '원' 단위를 가정합니다.
  //       const formatted_value = Math.floor(current_value).toLocaleString() + '원';
  //       ref_element.textContent = formatted_value;

  //       // 🚀 애니메이션 지속 조건 체크
  //       if (calculate_progress < 1) {
  //           // 진행 중: 다음 프레임 요청
  //           animated_frame = window.requestAnimationFrame(count_rate);
  //       } else {
  //           // 완료: 최종 값으로 설정하고 종료
  //           ref_element.textContent = (end_value).toLocaleString() + '원';
  //       }
  //   };

  //   // 💡 4. 애니메이션 루프 시작
  //   window.requestAnimationFrame(count_rate);
  // };
  const animateCount = (post_live_obj: props) => {
    // 1. Ref와 DOM 요소 유효성 체크 및 추출
    if (!post_live_obj?.ref || !post_live_obj.ref.current) return;
    const ref_element = post_live_obj.ref.current as HTMLDivElement; // TypeScript를 위해 타입 명시

    // 2. 현재 DOM의 시작 값 추출 (단위 없이 순수 숫자 문자열 가정)
    const start_text = ref_element.textContent || "0";

    // 💡 문자열에서 숫자만 추출하여 시작 값 (숫자) 확보
    // 현재는 "원" 단위가 없다고 가정하므로, 숫자로 변환합니다.
    const start_value = parseInt(start_text.replace(/[^0-9]/g, ""), 10);

    // 3. 목표 값 설정 (현재는 fund만 처리)
    const fund_end_value = post_live_obj.payload?.fund || 0;
    const end_value = fund_end_value; // 목표 값
    const unit = "원"; // 현재는 fund만 처리하므로 단위를 '원'으로 고정

    // 4. 애니메이션 불필요 조건
    if (start_value === end_value) return;

    const duration = 1000;
    let start_timestamp = 0;
    let animated_frame: number;

    // 5. 애니메이션 루프 함수 (count_rate) 정의
    const count_rate = (timestamp: number) => {
      if (!start_timestamp) start_timestamp = timestamp;

      const calculate_progress = Math.min(
        (timestamp - start_timestamp) / duration,
        1
      );

      console.log("start_value", start_value, "end_value", Number(end_value));
      // Easing 함수 적용 (Cubic Out)
      const progress = 1 - Math.pow(1 - calculate_progress, 3);

      // 현재 값 계산
      const current_value =
        start_value + progress * (Number(end_value) - start_value);

      // 🚀 DOM 업데이트: 계산된 값에 toLocaleString() 적용 후 단위 추가
      const formatted_value = Math.floor(current_value).toLocaleString() + unit;
      ref_element.textContent = formatted_value;

      // 🚀 애니메이션 지속 조건 체크
      if (calculate_progress < 1) {
        // 진행 중: 다음 프레임 요청
        animated_frame = window.requestAnimationFrame(count_rate);
      } else {
        // 완료: 최종 값으로 설정하고 종료
        ref_element.textContent = end_value.toLocaleString() + unit;

        // 💡 [선택 사항] 애니메이션 종료 후 다음 애니메이션을 위해 frame ID 관리 변수를 정리합니다.
        window.cancelAnimationFrame(animated_frame);
      }
    };

    // 6. 애니메이션 시작
    window.requestAnimationFrame(count_rate);
  };
  return { avgForWeek, animateCount };
};
