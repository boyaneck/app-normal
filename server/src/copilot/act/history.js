import { COPILOT_CONFIG } from "../config.js";

/**
 * 방마다 최근 코파일럿 멘트 N개를 기억한다.
 * 시스템 프롬프트에 "직전 멘트와 의도가 겹치면 출력하지 마라"는 규칙이 있었지만
 * 정작 직전 멘트를 LLM에게 알려주지 않아서 지킬 수가 없었다. → 이제 함께 보낸다.
 */
const histories = new Map();

export const getRecentLines = (roomName) => histories.get(roomName) ?? [];

export const pushLine = (roomName, line) => {
  const list = [...getRecentLines(roomName), line].slice(-COPILOT_CONFIG.HISTORY_SIZE);
  histories.set(roomName, list);
};

export const resetHistory = (roomName) => {
  histories.delete(roomName);
};
