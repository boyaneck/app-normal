// // decision.js — 감지 결과를 받아 "개입할 가치가 있나"를 판단한다

const Z_THRESHOLD = 2.0;
const SCORE_THRESHOLD = 1.5;
const COOLDOWN_MS = 3 * 60 * 1000;

const ACTIONABILITY = {
  donation: 1.0,
  chat: 0.8,
  viewer: 0.6,
};

const lastFired = new Map();
// /**
//  * 감지 결과 묶음(metricMetrics 반환값)을 받아
//  * 개입할 사건이 있으면 가장 점수 높은 것 하나를 돌려준다.
//  * @returns {null | { metric, z, score, value, slope }}
//  */
export const decide = (roomName, metric) => {
  const now = metric.now;
  if (!lastFired.has(roomName)) lastFired.set(roomName, {});
  const fired = lastFired.get(roomName);

  const candidates = [];

  for (const key of ["donation", "chat", "viewer"]) {
    const m = metric[key];
    if (!m.ready) continue; // 워밍업 안 끝남
    if (m.z < Z_THRESHOLD) continue; // 평범한 변동
    if (m.slope <= 0) continue; // 상승 추세일 때만 (급락 감지는 별도)

    // 쿨다운: 같은 지표를 최근에 쐈으면 스킵
    if (fired[key] && now - fired[key] < COOLDOWN_MS) continue;

    // 개입점수 계산
    const abnormality = Math.min(m.z / Z_THRESHOLD, 3); // z 정규화 (상한 3)
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

  fired[winner.metric] = now; // 쿨다운 기록
  return winner;
};
