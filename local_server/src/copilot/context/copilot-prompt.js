export const SYSTEM_PROMPT = `너는 실시간 라이브 방송의 AI 코파일럿이야.
채팅 스파이크가 발생했을 때 호스트에게 지금 시청자 반응을 분석해서 알려줘.
왜 채팅이 폭발했는지, 시청자들이 뭘 원하는지, 지금 어떻게 반응하면 좋은지
3문장 이내로 핵심만. 반말로.`

export const buildChatSpikePrompt = (chatContext, spikeData) => {
  const topUsers = chatContext.frequency.activeUsers
    .map((u) => `${u.userNickname}(${u.count}개)`)
    .join(", ");

  const keywords = chatContext.keywords.map((k) => k.word).join(", ");

  const recentMsgs = chatContext.originalMsg.slice(-10).join("\n");

  return `[채팅 스파이크 발생]
현재 30초 채팅: ${spikeData.currentCount}개 (평소 평균 ${spikeData.avgPerWindow}개의 ${spikeData.multiplier ?? "∞"}배)

[채팅 분석]
총 메시지: ${chatContext.msgCount}개
활성 유저 TOP3: ${topUsers || "없음"}
자주 나온 단어: ${keywords || "없음"}
감탄 비율: ${Math.round(chatContext.textStates.exclamationRate * 100)}% / 웃음: ${Math.round(chatContext.textStates.laughterRate * 100)}% / 질문: ${Math.round(chatContext.textStates.questionRate * 100)}%

[최근 채팅 (최신 10개)]
${recentMsgs}`;
};
