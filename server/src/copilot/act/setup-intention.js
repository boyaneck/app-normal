const THRESHOLD = {
  question: 0.2,
  laughter: 0.3,
  keywordCount: 3,
};

// 채팅 급증 시: 채팅 내용의 특징으로 "무엇을 말할지" 결정
const chatContextRules = [
  {
    priority: 80,
    match: (c) => c.textStates.questionRate >= THRESHOLD.question,
    build: (c) => ({
      intention: `might want to answer questions`,
      brief: `질문이 빠르게 올라오는 중 , 대표 질문 한두 개 골라서 답변 하는 것이 바람직함`,
      requiresNickname: false,
      focusData: {
        questions: c.originalMsg.filter((l) => l.includes("?") || /어요|나요|까요/.test(l)),
      },
    }),
    describe: (focusData) =>
      focusData.questions.length
        ? `최근질문:<viewer_chat>${focusData.questions.join(" / ")}</viewer_chat>`
        : `최근질문:없음`,
  },
  {
    priority: 70,
    match: (c) => c.textStates.laughterRate >= THRESHOLD.laughter,
    build: (c) => ({
      intention: `might want to elevate laughter `,
      brief: `채팅창에서 사람들의 반응이 좋네, 반응을 확인하고 유도해 봐 `,
      requiresNickname: false,
      focusData: {
        keywords: c.keywords[0]?.word ?? null,
        original: c.originalMsg.slice(0, 5),
      },
    }),
    describe: (focusData) =>
      focusData.keywords
        ? `반응좋은 키워드 :<viewer_chat>${focusData.keywords}</viewer_chat>`
        : `반응좋은 키워드 :없음`,
  },
  {
    priority: 60,
    match: (c) => (c.keywords[0]?.count ?? 0) >= THRESHOLD.keywordCount,
    build: (c) => ({
      intention: "might want to catch the topic ",
      brief: "특정 화제로 채팅창이 달아오름. 뜨는 키워드를 잡아 리액션 유도.",
      requiresNickname: false,
      focusData: { keywords: c.keywords.slice(0, 3).map((k) => k.word) },
    }),
    describe: (focusData) =>
      `뜨고 있는 키워드:<viewer_chat>${focusData.keywords.join(" / ")}</viewer_chat>`,
  },
  // 예전에는 여기에 "특징 없음(nothing)" 기본 규칙이 있어서,
  // 할 말이 없는데도 LLM을 호출했다. → 이제 매칭되는 규칙이 없으면 null (침묵이 기본값)
];

const makeChatIntention = (chat) => {
  if (!chat || chat.msgCount <= 0) return null;
  // priority는 개발자가 정한 값. 질문에 답하는 것이 호스트에게 가장 중요하다고 보고 최우선으로 둠
  const rule = chatContextRules
    .filter((r) => r.match(chat))
    .sort((a, b) => b.priority - a.priority)[0];
  if (!rule) return null;
  return { ...rule.build(chat), describe: rule.describe };
};

// 후원 급증 시: 후원자에게 감사 인사
const makeDonationIntention = (donation) => {
  if (!donation || donation.count === 0) return null;
  return {
    intention: "might want to thank donors",
    brief: `최근 1분 동안 후원 ${donation.count}건(${donation.totalAmount.toLocaleString()}원)이 몰림. 후원자 이름을 불러 감사 인사를 하면 좋음.`,
    requiresNickname: true,
    focusData: { donors: donation.donors.slice(0, 3) },
    describe: (focusData) =>
      `후원자:<viewer_chat>${focusData.donors.join(" / ")}</viewer_chat>`,
  };
};

// 시청자 급증 시: 새로 들어온 사람들을 위한 인사와 상황 소개
const makeViewerIntention = (viewer) => {
  if (!viewer) return null;
  return {
    intention: "might want to greet newcomers",
    brief: `시청자가 평소보다 빠르게 늘고 있음(현재 ${viewer.current}명). 새로 온 시청자에게 인사하고 지금 방송 내용을 한 줄로 소개하면 좋음.`,
    requiresNickname: false,
    focusData: {},
  };
};

/**
 * 감지된 사건(event.metric)에 맞는 맥락으로 LLM에게 줄 "의도"를 만든다.
 * @returns 의도 객체 또는 null(말할 필요 없음)
 */
export const setupGROQIntention = ({ event, chat, donation, viewer }) => {
  switch (event?.metric) {
    case "donation":
      return makeDonationIntention(donation);
    case "viewer":
      return makeViewerIntention(viewer);
    case "chat":
    default:
      return makeChatIntention(chat);
  }
};
