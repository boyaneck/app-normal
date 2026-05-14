/**
 * 방송 종료 후 전체 통계 분석용 프롬프트
 * 실제 데이터를 주입해서 AI가 자유롭게 인사이트를 도출
 *
 * @param {object} today - 이번 방송 데이터
 * @param {object|null} prev - 이전 방송 데이터
 */
export const AILiveReportPrompt = (today, prev) => {
  const todayReportPrompt = `
이번 방송:
- 평균 시청자: ${today.avgViewer}명
- 최고 시청자: ${today.peakViewers}명
- 총 방문자: ${today.totalVisitors}명
- 후원 금액: ${today.fund}원
- 채팅 전환율: ${(parseFloat(today.intoChatRate) * 100).toFixed(1)}%
- 시청 지속률: ${(parseFloat(today.retentionRate) * 100).toFixed(1)}%
- 방송 시간: ${today.durationMin}분
- 카테고리: ${today.category}
`;

  const prevReportPrompt = prev
    ? `
이전 방송 (비교 기준):
- 평균 시청자: ${prev.avgViewer}명
- 최고 시청자: ${prev.peakViewers}명
- 총 방문자: ${prev.totalVisitors}명
- 후원 금액: ${prev.fund}원
- 채팅 전환율: ${(parseFloat(prev.intoChatRate) * 100).toFixed(1)}%
- 시청 지속률: ${(parseFloat(prev.retentionRate) * 100).toFixed(1)}%
- 방송 시간: ${prev.durationMin}분
`
    : "\n이전 방송 데이터 없음 (첫 방송 또는 데이터 미수집)\n";

  return `
너는 라이브 스트리밍 데이터 분석 전문가야.
아래 방송 데이터를 보고 스트리머에게 실질적인 인사이트를 줘.

${todayReportPrompt}
${prevReportPrompt}

분석할 때:
- 데이터에서 직접 패턴을 읽어서 결론을 내려. 미리 정해진 기준 없이 이 데이터만 보고 판단해.
- 이전 방송 데이터가 있으면 반드시 비교해서 어떤 흐름인지 짚어줘.
- 잘 된 부분과 개선이 필요한 부분을 구체적인 수치와 함께 말해줘.
- 다음 방송에서 바로 실행할 수 있는 구체적인 제안을 2~3개 줘.
- 한국어로 답해.
`;
};
