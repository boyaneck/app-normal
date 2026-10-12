// // decision.js — 감지 결과를 받아 "개입할 가치가 있나"를 판단한다

// TODO: 데모용 — 원래 Z_THRESHOLD=2.0, SCORE_THRESHOLD=0.8 이었음
// EMA/EWVar 기반 z-score는 "평평하다가 처음 튀는" 시점엔 튀는 크기와 무관하게
// z가 대략 1/sqrt(alpha*(1-alpha))로 고정된다 (alpha=0.3 → z≈2.18).
// 데모에서는 채팅 2~3개만 쳐도 확실히 넘도록 둘 다 크게 낮춰둠.
const Z_THRESHOLD = 0.3;
const SCORE_THRESHOLD = 0.1;
// TODO: 데모용 — 원래 10초(그 전엔 3분)였음. 채팅 하나하나마다 매번 응답 받고 싶다고 해서 사실상 비활성화.
const COOLDOWN_MS = 0;

const ACTIONABILITY = {
  donation: 1.0,
  chat: 0.8,
  viewer: 0.6,
};

const lastSpiked = new Map();

// 방송 종료 시 호출 — 쿨다운 기록이 다음 방송으로 이어지지 않도록 정리
export const resetRoomDecision = (roomName) => {
  lastSpiked.delete(roomName);
};
// /**
//  * 감지 결과 묶음(metricMetrics 반환값)을 받아
//  * 개입할 사건이 있으면 가장 점수 높은 것 하나를 돌려준다.
//  * @returns {null | { metric, z, score, value, slope }}
//  */
export const decide = (roomName, metric) => {
  const now = metric.now;
  if (!lastSpiked.has(roomName)) lastSpiked.set(roomName, {});
  const spiked = lastSpiked.get(roomName);

  const candidates = [];

  // donation/viewer는 metric.js에서 계속 감지는 하지만, setup-intention.js가
  // 아직 chat용 규칙만 있어서 이 둘이 이벤트로 뽑히면 intention이 비어
  // generateLine에서 크래시남. donation/viewer용 규칙 생기기 전까진 chat만 후보로.
  for (const key of ["chat"]) {
    const m = metric[key];
    if (!m.ready) continue; // 워밍업 안 끝남
    if (m.z < Z_THRESHOLD) continue; // 평범한 변동
    if (m.slope <= 0) continue; // 상승 추세일 때만 (급락 감지는 별도)

    // 쿨다운: 같은 지표를 최근에 쐈으면 스킵
    if (spiked[key] && now - spiked[key] < COOLDOWN_MS) continue;

    // 개입점수 계산
    const abnormality = Math.min(m.z / Z_THRESHOLD, 3); // z 정규화 (상한 3)
    //actionalbility 의 값을 통일시켜야하나 ??
    const actionability = ACTIONABILITY[key];
    const timeliness = 1.0; // 지금은 고정. 나중에 방송 국면별로 조정 가능
    const score = abnormality * actionability * timeliness;

    if (score >= SCORE_THRESHOLD) {
      candidates.push({
        metric: key,
        z: m.z,
        score,
        value: m.value,
        slope: m.slope,
      });
    }
  }

  if (candidates.length === 0) return null;

  // 점수 가장 높은 사건 하나만 (한 번에 하나만 개입)
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];

  spiked[winner.metric] = now; // 쿨다운 기록
  return winner;
};
