// decision.js — 감지 결과를 받아 "개입할 가치가 있나"를 판단한다
import { COPILOT_CONFIG, ACTIONABILITY } from "../config.js";

const { Z_THRESHOLD, SCORE_THRESHOLD, COOLDOWN_MS } = COPILOT_CONFIG;

// 예전에는 setup-intention에 chat 규칙만 있어서 chat만 후보로 썼다.
// 이제 donation / viewer 의도 규칙이 생겨서 세 지표 모두 후보가 된다.
const METRICS = ["donation", "chat", "viewer"];

const lastSpiked = new Map();

// 방송 종료 시 호출 — 쿨다운 기록이 다음 방송으로 이어지지 않도록 정리
export const resetRoomDecision = (roomName) => {
  lastSpiked.delete(roomName);
};

/**
 * 감지 결과 묶음(getMetrics 반환값)을 받아
 * 개입할 사건이 있으면 가장 점수 높은 것 하나를 돌려준다.
 * @returns {null | { metric, z, score, value, slope }}
 */
export const decide = (roomName, metric) => {
  const now = metric.now;
  if (!lastSpiked.has(roomName)) lastSpiked.set(roomName, {});
  const spiked = lastSpiked.get(roomName);

  const candidates = [];

  for (const key of METRICS) {
    const m = metric[key];
    if (!m?.ready) continue; // 워밍업 안 끝남
    if (m.value <= 0) continue; // 아무 일도 없는 구간
    if (m.z < Z_THRESHOLD) continue; // 평범한 변동
    if (m.slope <= 0) continue; // 상승 추세일 때만 (급락 감지는 별도)

    // 쿨다운: 같은 지표를 최근에 쐈으면 스킵
    if (spiked[key] && now - spiked[key] < COOLDOWN_MS) continue;

    // 개입점수 = 얼마나 이상한가 × 호스트가 바로 행동할 수 있나 × 지금이 적절한가
    const abnormality = Math.min(m.z / Z_THRESHOLD, 3); // z 정규화 (상한 3)
    const actionability = ACTIONABILITY[key];
    const timeliness = 1.0; // 지금은 고정. 나중에 방송 국면별로 조정 가능
    const score = abnormality * actionability * timeliness;

    if (score >= SCORE_THRESHOLD) {
      candidates.push({ metric: key, z: m.z, score, value: m.value, slope: m.slope });
    }
  }

  if (candidates.length === 0) return null;

  // 점수 가장 높은 사건 하나만 (한 번에 하나만 개입)
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];

  spiked[winner.metric] = now; // 쿨다운 기록
  return winner;
};
