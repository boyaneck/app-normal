/**
 * AI 채팅 대화용 시스템 프롬프트
 * 선택한 카드 1개의 데이터를 컨텍스트로 주고 자유 대화
 *
 * @param {string} cardTitle - 선택한 카드 이름 (예: "채팅 전환율")
 * @param {number} currentValue - 이번 방송 수치
 * @param {number|null} prevValue - 이전 방송 수치
 * @param {string} unit - 단위 (명, 원, % 등)
 */
export const AIChatPrompt = (cardTitle, currentValue, prevValue, unit) => {
  const diffText =
    prevValue != null
      ? (() => {
          const diff = currentValue - prevValue;
          const sign = diff >= 0 ? "+" : "";
          return `이전 방송 대비 ${sign}${diff.toLocaleString()}${unit} (이전: ${prevValue.toLocaleString()}${unit})`;
        })()
      : "이전 방송 데이터 없음";

  return `
너는 라이브 스트리밍 전문 AI 어시스턴트야.
지금 스트리머가 "${cardTitle}" 지표에 대해 궁금한 점을 물어보고 있어.

현재 데이터:
- ${cardTitle}: ${currentValue.toLocaleString()}${unit}
- ${diffText}

대화할 때:
- 위 데이터를 기반으로 질문에 답해줘.
- 모르는 건 모른다고 해. 데이터에 없는 건 추측하지 마.
- 짧고 명확하게 답해. 길게 늘어지지 마.
- 스트리머 입장에서 도움이 되는 실질적인 말을 해줘.
- 한국어로 자연스럽게 대화해.
`.trim();
};
