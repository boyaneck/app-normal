import { useCallback, useEffect, useMemo, useRef } from "react";

// NOTE: 외부 타입은 가정하여 정의합니다.
interface post_live_stats_props {
  avg_viewer: number | string;
  peak_viewer: number | string;
  into_chat_rate: number | string;
  fund: number | string;
  [key: string]: any; // 모든 지표를 포괄하기 위해 추가
}
type stat_key = "avg_viewer" | "peak_viewer" | "into_chat_rate" | "fund";

type ref_store = Record<string, HTMLDivElement | null>;
interface props {
  payload: post_live_stats_props;
  ref: ref_store | null | undefined;
}

// 💡 1. 지표별 설정 정의 (접두사/접미사 및 소수점 자릿수)
const STAT_CONFIG: Record<
  stat_key,
  { decimal: number; prefix: string; suffix: string }
> = {
  avg_viewer: { decimal: 0, prefix: "", suffix: "명" },
  peak_viewer: { decimal: 0, prefix: "", suffix: "명" },
  into_chat_rate: { decimal: 2, prefix: "", suffix: "%" }, // 소수점 2자리 필요
  fund: { decimal: 0, prefix: "₩", suffix: "원" },
};

// --------------------------------------------------------------------------------

const formatNumber = (
  value: number,
  decimal: number,
  prefix: string,
  suffix: string
) => {
  let formatted: string;
  if (decimal > 0) {
    // 소수점 자리수 유지
    formatted = value.toFixed(decimal);
  } else {
    // 정수 포맷 (반올림 후 쉼표 추가)
    formatted = Math.round(value).toLocaleString("ko-KR");
  }
  return prefix + formatted + suffix;
};

// ... avgForWeek 함수는 변경 없이 유지 ...
const avgForWeek = (post_live_stats: post_live_stats_props[] | null) => {
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

// --------------------------------------------------------------------------------

export const usePostLive = () => {
  // 💡 2. 모든 지표의 requestAnimationFrame ID를 저장하여 개별적으로 관리합니다.
  const animationFramesRef = useRef<Record<stat_key, number>>(
    {} as Record<stat_key, number>
  );

  const animateCount = (post_live_obj: props) => {
    if (!post_live_obj?.ref || !post_live_obj.payload) return;

    const duration = 500;

    // 이전 애니메이션들을 모두 취소합니다.
    Object.values(animationFramesRef.current).forEach((id) => {
      window.cancelAnimationFrame(id);
    });
    animationFramesRef.current = {} as Record<stat_key, number>;

    // 💡 3. 모든 지표를 순회하며 각각의 애니메이션을 독립적으로 실행합니다.
    (Object.keys(STAT_CONFIG) as stat_key[]).forEach((key) => {
      const config = STAT_CONFIG[key];
      const ref_element = post_live_obj?.ref[key]; // Ref DOM 요소

      // 목표 값 (payload에서 가져옴)
      const after_value = Number(post_live_obj.payload[key]);

      if (!ref_element || isNaN(after_value)) {
        return;
      }

      // 시작 값 파싱 (DOM에서 현재 표시된 텍스트에서 콤마, 단위 등을 제거하고 숫자로 변환)
      const before_text = ref_element.textContent || "0";
      const start_text_cleaned = before_text.replace(/[^0-9.]/g, "") || "0";

      // 소수점 유무에 따라 파싱 방식 결정
      const start_value =
        config.decimal > 0
          ? parseFloat(start_text_cleaned)
          : parseInt(start_text_cleaned) || 0;

      const end_value = after_value;

      // 시작 값과 목표 값이 같으면 애니메이션 없이 최종 값으로 설정하고 종료
      if (start_value === end_value) {
        ref_element.textContent = formatNumber(
          end_value,
          config.decimal,
          config.prefix,
          config.suffix
        );
        return;
      }

      let start_timestamp = 0;

      const count_rate = (timestamp: number) => {
        if (!start_timestamp) start_timestamp = timestamp;

        const calculate_progress = Math.min(
          (timestamp - start_timestamp) / duration,
          1
        );

        // Easing 함수: 부드러운 애니메이션 효과 적용
        const progress = 1 - Math.pow(1 - calculate_progress, 3);

        const current_value =
          start_value + progress * (end_value - start_value);

        // DOM 요소 업데이트
        ref_element.textContent = formatNumber(
          current_value,
          config.decimal,
          config.prefix,
          config.suffix
        );

        if (calculate_progress < 1) {
          // 다음 프레임 요청 및 ID 저장
          animationFramesRef.current[key] =
            window.requestAnimationFrame(count_rate);
        } else {
          // 애니메이션 완료 시 최종 목표 값으로 정확히 설정
          ref_element.textContent = formatNumber(
            end_value,
            config.decimal,
            config.prefix,
            config.suffix
          );
          // 완료된 애니메이션 ID 제거
          delete animationFramesRef.current[key];
        }
      };

      // 💡 4. 각 지표별 애니메이션 루프 시작
      animationFramesRef.current[key] =
        window.requestAnimationFrame(count_rate);
    });
  };

  // 컴포넌트 언마운트 시 모든 애니메이션 정리 (클린업)
  useEffect(() => {
    return () => {
      Object.values(animationFramesRef.current).forEach((id) => {
        window.cancelAnimationFrame(id);
      });
    };
  }, []);

  return { avgForWeek, animateCount };
};
