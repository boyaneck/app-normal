// import { live_stat_count_props, post_live_stats_props } from "@/types/live";
// import { useCallback, useEffect, useMemo, useRef } from "react";

// const formatNumber = (
//   value: number,
//   decimal: number,
//   prefix: string,
//   suffix: string
// ) => {
//   let formatted;
//   if (decimal > 0) {
//     formatted = value.toFixed(decimal);
//   } else {
//     formatted = Math.round(value).toLocaleString("ko-KR");
//   }
//   return prefix + formatted + suffix;
// };
// const avgForWeek = (post_live_stats: post_live_stats_props[] | null) => {
//   console.log(
//     "처음 평균값을 구하기 위해 데이터가 들어온다",
//     post_live_stats?.length
//   );

//   const stat_array = Array.isArray(post_live_stats) ? post_live_stats : [];
//   const days_of_live = stat_array.length;

//   // 방송 횟수가 0이면 계산 없이 초기값 반환
//   if (days_of_live === 0) {
//     return {
//       avg_viewer: 0,
//       peak_viewer: 0,
//       into_chat_rate: "0.00",
//       fund: 0,
//     };
//   }

//   const initial_sums = {
//     avg_viewer_sum: 0,
//     peak_viewer_sum: 0,
//     into_chat_rate_sum: 0,
//     fund_sum: 0,
//   };

//   // reduce를 이용해 모든 지표의 총합 계산 (객체 초기값 필수)
//   stat_array;
//   const totals = stat_array.reduce((acc, day) => {
//     // null/undefined 값을 안전하게 0으로 변환하여 합산
//     acc.avg_viewer_sum += Number(day?.avg_viewer) || 0;
//     acc.peak_viewer_sum += Number(day?.peak_viewer) || 0;
//     acc.into_chat_rate_sum += Number(day?.into_chat_rate) || 0;
//     acc.fund_sum += Number(day?.fund) || 0;
//     return acc;
//   }, initial_sums);

//   return {
//     avg_viewer: Math.round(totals.avg_viewer_sum / days_of_live),
//     peak_viewer: Math.round(totals.peak_viewer_sum / days_of_live),
//     into_chat_rate: (totals.into_chat_rate_sum / days_of_live).toFixed(2),
//     fund: Math.round(totals.fund_sum / days_of_live),
//   };
// };

// type ref_store = Record<string, HTMLDivElement | null>;
// type store = Record<string, HTMLDivElement | null>;
// interface props {
//   payload: post_live_stats_props;
//   // ref: string | undefined;
//   ref: ref_store | null | undefined;
// }
// export const usePostLive = () => {
//   // const animateCount = ({
//   //   post_live_stats,
//   //   start,
//   //   end,
//   //   prefix,
//   //   suffix,
//   //   duration,
//   //   decimal,

//   //PAYLOAD는 현재 그래프의 CURSOR 가 가르키는 날짜의 VALUE
//   //ref는 현재 각가의 카드의 div
//   const animateCount = (post_live_obj: props) => {
//     console.log("데이터 확인하기", post_live_obj?.payload);
//     console.log(
//       "ref데이터들 각각 다 끄집어 내기 ",
//       post_live_obj?.ref?.peak_viewer?.textContent
//     );
//     if (!post_live_obj?.ref) return;
//     //현재 card의 데이터들
//     const before_avg_viewer = post_live_obj.ref?.avg_viewer?.textContent;
//     const before_fund = post_live_obj.ref?.fund?.textContent;
//     const before_chat_rate = post_live_obj?.ref.into_chat_rate?.textContent;
//     const before_peak_viewer = post_live_obj?.ref.peak_viewer?.textContent;
//     const duration = 1000;

//     const after_avg_viewer = post_live_obj.payload?.avg_viewer;
//     const after_fund = post_live_obj?.payload?.fund;
//     const after_chat_rate = post_live_obj?.payload.into_chat_rate;
//     const after_peak_viewer = post_live_obj?.payload.peak_viewer;

//     //바뀌어야 할 데이터들

//     // const ref_element = post_live_obj?.ref;/
//     const start_value = Number(post_live_obj?.ref) || 0;
//     const end_value = Number();
//     if (start_value === end_value) return;
//     let start_timestamp = 0;
//     let animated_frame: number; // requestAnimationFrame의 반환 타입
//     const count_rate = (timestamp: number) => {
//       if (!start_timestamp) start_timestamp = timestamp;

//       const calculate_progress = Math.min(
//         (timestamp - start_timestamp) / duration,
//         1
//       );

//       // Easing 함수 적용 (예: Cubic Out)
//       const progress = 1 - Math.pow(1 - calculate_progress, 3);

//       // 🚀 현재 값 계산: 시작 값 + 진행률 * (목표 값 - 시작 값)
//       const current_value = start_value + progress * (end_value - start_value);

//       // 🚀 DOM 업데이트 (단위 처리 필요)
//       // 현재는 fund이므로 '원' 단위를 가정합니다.
//       const formatted_value = Math.floor(current_value).toLocaleString() + "원";
//       ref_element = formatted_value;

//       // 🚀 애니메이션 지속 조건 체크
//       if (calculate_progress < 1) {
//         // 진행 중: 다음 프레임 요청
//         animated_frame = window.requestAnimationFrame(count_rate);
//       } else {
//         // 완료: 최종 값으로 설정하고 종료
//         ref_element = end_value.toLocaleString() + "원";
//       }
//     };

//     // 💡 4. 애니메이션 루프 시작
//     window.requestAnimationFrame(count_rate);
//   };
//   return { avgForWeek, animateCount };
// };
import { useCallback, useRef } from "react";
// NOTE: 아래 두 타입은 사용자의 프로젝트 "@/types/live" 경로에서 가져온다고 가정합니다.
// import { live_stat_count_props, post_live_stats_props } from "@/types/live";

// =====================================================================
// 1. 타입 정의 (Types)
// =====================================================================

// 라이브 통계 데이터 타입 (into_chat_rate는 문자열 또는 숫자일 수 있음)
export type post_live_stats_props = {
  avg_viewer: number;
  peak_viewer: number;
  into_chat_rate: string | number;
  fund: number;
};

// Ref 저장소 타입 (사용자가 지정한 HTMLDivElement 또는 Ref가 연결된 HTMLElement)
type RefStore = Record<string, HTMLElement | null>;

// animateCount에 전달되는 props 타입
interface AnimateProps {
  payload: post_live_stats_props;
  ref: RefStore | null | undefined;
}

// =====================================================================
// 2. 유틸리티 함수 (Utility Functions)
// =====================================================================

// 숫자를 포맷하는 함수 (사용자의 원본 함수 유지)
const formatNumber = (
  value: number,
  decimal: number,
  prefix: string,
  suffix: string
) => {
  let formatted: string;

  if (decimal > 0) {
    // 소수점 자리수가 0보다 크면 toFixed 사용
    formatted = value.toFixed(decimal);
  } else {
    // 정수형은 반올림 후 로케일 포맷팅
    formatted = Math.round(value).toLocaleString("ko-KR");
  }
  // prefix는 현재 통계 항목 설정에서 빈 문자열이므로 최종적으로는 생략될 수 있습니다.
  return prefix + formatted + suffix;
};

// 주간 평균 계산 함수 (사용자의 원본 로직 유지)
export const avgForWeek = (post_live_stats: post_live_stats_props[] | null) => {
  const stat_array = Array.isArray(post_live_stats) ? post_live_stats : [];
  const days_of_live = stat_array.length;

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

  const totals = stat_array.reduce((acc, day) => {
    acc.avg_viewer_sum += Number(day?.avg_viewer) || 0;
    acc.peak_viewer_sum += Number(day?.peak_viewer) || 0;
    // into_chat_rate를 숫자로 변환하여 합산
    acc.into_chat_rate_sum += Number(day?.into_chat_rate) || 0;
    acc.fund_sum += Number(day?.fund) || 0;
    return acc;
  }, initial_sums);

  return {
    avg_viewer: Math.round(totals.avg_viewer_sum / days_of_live),
    peak_viewer: Math.round(totals.peak_viewer_sum / days_of_live),
    into_chat_rate: (totals.into_chat_rate_sum / days_of_live).toFixed(2), // 문자열 "0.00" 형태 반환
    fund: Math.round(totals.fund_sum / days_of_live),
  };
};

// =====================================================================
// 3. 메인 훅: usePostLive (애니메이션 로직)
// =====================================================================

export const usePostLive = () => {
  // 💡 애니메이션 ID를 저장하여 중복 실행을 막는 Map
  const activeAnimations = useRef<Map<string, number>>(new Map());

  const animateCount = useCallback((post_live_obj: AnimateProps) => {
    if (!post_live_obj?.ref || !post_live_obj.payload) {
      console.error("animateCount: RefStore 또는 Payload가 유효하지 않습니다.");
      return;
    }

    const duration = 1000;
    const refStore = post_live_obj.ref;
    const payload = post_live_obj.payload;

    // 💡 4가지 통계 항목 설정 (각 항목에 대한 키, 단위, 소수점 정보 포함)
    const statsToAnimate = [
      {
        key: "avg_viewer",
        unit: "명",
        decimal: 0,
        refKey: "avg_viewer",
        prefix: "",
      },
      {
        key: "peak_viewer",
        unit: "명",
        decimal: 0,
        refKey: "peak_viewer",
        prefix: "",
      },
      {
        key: "into_chat_rate",
        unit: "%",
        decimal: 2,
        refKey: "into_chat_rate",
        prefix: "",
      },
      { key: "fund", unit: "원", decimal: 0, refKey: "fund", prefix: "" },
    ];

    // 4가지 통계 항목을 개별적으로 처리하는 루프
    statsToAnimate.forEach((stat) => {
      const { key, unit, decimal, refKey, prefix } = stat;

      const refElement = refStore[refKey];
      // Payload에서 현재 통계 항목의 새 값 추출 및 숫자로 변환
      const afterValue = Number(payload[key as keyof post_live_stats_props]);

      if (!refElement || !refElement.textContent || isNaN(afterValue)) {
        console.warn(
          `Animation skip: ${key}의 Ref나 Payload 값이 유효하지 않음`
        );
        return;
      }

      // 1. 시작 값 정제: DOM 텍스트에서 숫자만 추출 (콤마, 단위, 접두사 모두 제거)
      const beforeText = refElement.textContent;
      // 💡 [오류 수정]: 텍스트에서 숫자만 파싱하는 강력한 정규식 사용
      const startValue = Number(beforeText.replace(/[^\d.-]/g, "")) || 0;

      // 2. 종료 값
      const endValue = afterValue;

      if (startValue === endValue) {
        refElement.textContent = formatNumber(endValue, decimal, prefix, unit);
        return;
      }

      // 3. 이전 애니메이션이 있다면 취소
      if (activeAnimations.current.has(key)) {
        window.cancelAnimationFrame(activeAnimations.current.get(key)!);
        activeAnimations.current.delete(key);
      }

      let startTimestamp = 0;

      const count_rate = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;

        const calculate_progress = Math.min(
          (timestamp - startTimestamp) / duration,
          1
        );

        // Easing (Cubic Out: 부드러운 감속)
        const progress = 1 - Math.pow(1 - calculate_progress, 3);

        // 현재 값 계산
        const currentValue = startValue + progress * (endValue - startValue);

        // 4. DOM 업데이트 및 포맷팅
        let valueToFormat = currentValue;

        if (calculate_progress < 1) {
          // 진행 중: 정수형은 floor 처리
          valueToFormat = decimal > 0 ? currentValue : Math.floor(currentValue);

          // 다음 프레임 요청 및 ID 저장
          const animated_frame = window.requestAnimationFrame(count_rate);
          activeAnimations.current.set(key, animated_frame);
        } else {
          // 완료 시점: 정확한 최종 값으로 설정하고 종료
          valueToFormat = endValue;
          activeAnimations.current.delete(key);
        }

        // 💡 [오류 수정]: 텍스트 컨텐츠 업데이트
        refElement.textContent = formatNumber(
          valueToFormat,
          decimal,
          prefix,
          unit
        );
      };

      // 5. 애니메이션 시작
      const initial_frame_id = window.requestAnimationFrame(count_rate);
      activeAnimations.current.set(key, initial_frame_id);
    });
  }, []);

  return { avgForWeek, animateCount };
};
