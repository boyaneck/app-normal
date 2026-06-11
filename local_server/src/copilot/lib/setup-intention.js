

const THRESHOLD={
    question:0.2,
    laughter:0.3,
    keywordCount:3,
}

const chatContextRules=[
    {priority:80,
        match:(c)=>c.textStats.qestionRate>=THRESHOLD.question,
        build:(c)=>({
        intention:`might want to answer questions`,
        brief:`질문이 빠르게 올라오는 중 , 대표 질문 한두 개 골라서 답변 하는 것이 바람직함`,
        requireNickname:false,
         focusData: {
        questions: c.original.filter(l => l.includes("?") || /어요|나요|까요/.test(l)),
      },

        })
    },
    {priority:70,
        build:(c)=>(chat.textStates.laughterRate>=THRESHOLD.laughter),
        intention:`might want to elevate laughter `,
        brief:`채팅창에서 사람들의 반응이 좋네, 반응을 확인하고 유도해 봐 `,
 requiresNickname: false,
      focusData: {
        topKeyword: c.keywords[0]?.word ?? null,
        sample: c.original.slice(0, 5),
      },
    }
    {
    priority: 60,
    match: (c) => (c.keywords[0]?.count ?? 0) >= THRESHOLD.keywordCount,
    build: (c) => ({
      intent: "might want to catch the topic ",
      brief: "특정 화제로 채팅창이 달아오름. 뜨는 키워드를 잡아 리액션 유도.",
      requiresNickname: false,
      focusData: { keywords: c.keywords.slice(0, 3).map(k => k.word) },
    }),
  },
     {
    priority: 10, // 아무 특징 없을 때 기본값
    match: () => true,
    build: (c) => ({
      intent: "nothing",
      brief: "큰 반응이 없음, 조금 더 채팅창의 반응을 살펴볼 것 .",
      requiresNickname: false,
      focusData: { sample: c.original.slice(0, 5) },
    }),
  },
]






export const setupGROQIntention = (extractedContexts) => {
const {donation,chat,viewer}=extractedContexts
const makeChatGROQIntention=(chat)=>{
if(!chat ||chat.count <= 0) return null
const chatContext=chatContextRules.filter((c)=>c.match(chat)).sort((a,b)=>b.priority-a.priority)[0]
return chatContext.build(chat)

}



};
