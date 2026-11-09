/**
 * 코파일럿 설정값을 한 곳에 모은 파일
 *
 * 예전 문제:
 *  - 값이 loop.js / metric.js / detector.js / decision.js 에 흩어져 있었고
 *  - "loop.js의 주기와 metric.js의 윈도우를 반드시 같이 바꿀 것" 같은 규칙이 주석으로만 존재했다.
 *  - 데모용 값(2초 주기, z 0.3, 쿨다운 0)이 그대로 남아 거의 2초마다 LLM을 호출했다.
 *
 * 이제:
 *  - 관찰 주기 = 집계 윈도우를 같은 상수 하나로 묶어서 어긋날 수 없게 했다.
 *  - 기본은 운영값. 데모가 필요하면 서버 .env에 COPILOT_DEMO=true 를 넣으면 데모값으로 바뀐다.
 */
const PRODUCTION = {
  OBSERVE_INTERVAL_MS: 15 * 1000, // 관찰 주기 = 채팅/후원 집계 윈도우
  ALPHA: 0.3, // EMA 반응성 (0~1, 클수록 최근값에 민감)
  VIEWER_ALPHA: 0.2, // 시청자 수는 더 천천히 반응
  WARMUP: 5, // 최소 표본 수 (이 전에는 z를 믿지 않음)
  MIN_STD: 1, // 표준편차 하한 (단위: 개수). 0으로 나누기 + 평평할 때 z 폭주 방지
  Z_THRESHOLD: 2.0, // 평소 대비 몇 표준편차 이상 튀어야 "사건"인가
  SCORE_THRESHOLD: 0.8, // 개입 점수 하한
  COOLDOWN_MS: 45 * 1000, // 같은 지표로 다시 말 걸기까지 최소 간격
  HISTORY_SIZE: 3, // LLM에게 알려줄 "직전 멘트" 개수 (중복 멘트 방지)
};

const DEMO = {
  ...PRODUCTION,
  OBSERVE_INTERVAL_MS: 3 * 1000,
  WARMUP: 1,
  Z_THRESHOLD: 1.0,
  SCORE_THRESHOLD: 0.3,
  COOLDOWN_MS: 8 * 1000,
};

export const COPILOT_CONFIG = process.env.COPILOT_DEMO === "true" ? DEMO : PRODUCTION;

// 지표별 "호스트가 바로 행동할 수 있는 정도" 가중치
export const ACTIONABILITY = {
  donation: 1.0,
  chat: 0.8,
  viewer: 0.6,
};
