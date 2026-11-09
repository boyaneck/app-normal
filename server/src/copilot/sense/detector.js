import { COPILOT_CONFIG } from "../config.js";

/**
 * EMA(지수이동평균) + EWVar(지수가중분산) 기반 급증 감지기
 *
 * 바뀐 점 (z-score 계산 순서):
 *  예전에는 "현재 값으로 분산을 먼저 갱신한 뒤" z를 구했다.
 *  그러면 현재 값이 자기 자신의 기준선(분산)에 섞여서, 평평하다가 처음 튈 때
 *  튀는 크기와 상관없이 z ≈ 1/sqrt(alpha*(1-alpha)) ≈ 2.18 로 고정됐다.
 *  → 이제 "갱신 전" 표준편차로 z를 구한다. "평소(과거)에 비해 지금이 얼마나 튀었나"가 z의 원래 의미다.
 */
export const createDetector = ({
  alpha = COPILOT_CONFIG.ALPHA,
  warmUp = COPILOT_CONFIG.WARMUP,
  minStd = COPILOT_CONFIG.MIN_STD,
} = {}) => {
  let count = 0;
  let ema = 0; // 지수이동평균 (현재 추세값)
  let ewvar = 0; // 지수가중분산

  const update = (value) => {
    count++;

    const prevEma = ema;
    const prevStd = Math.sqrt(ewvar);
    const delta = value - prevEma;

    // 1) 과거 기준선으로 판단
    const z = delta / Math.max(prevStd, minStd);

    // 2) 그 다음에 현재 값을 기준선에 반영
    ema = prevEma + alpha * delta;
    ewvar = (1 - alpha) * (ewvar + alpha * delta * delta);

    const slope = ema - prevEma; // 추세 방향 (양수면 상승, 음수면 하강)

    // 워밍업 전(첫 몇 틱)에는 기준선이 아직 없으므로 ready=false
    return { z, ema, slope, ready: count > warmUp };
  };

  return update;
};
