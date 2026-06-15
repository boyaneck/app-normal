import { isContext } from "node:vm";

const SYSTEM_PROMPT = `너는 라이브 방송 호스트의 실시간 코파일럿이다. 호스트는 화면 구석으로 너를 흘긋 본다.

규칙:
- 딱 1문장. 0.5초 안에 읽고 행동 가능하게.
- 지금 데이터의 구체적 정보(닉네임·키워드)를 멘트에 넣어라. 일반론·이모지·서론 금지.
- 신호가 약하거나, 직전 멘트와 의도가 겹치거나, 호스트가 알아서 반응할 사소한 변화면 출력하지 마라.`;




const generateLine=async(intention,extractedContexts)=>{

const userPrompt=buildUserPrompt(intention,extractedContexts)


try {
    const res=await groq

} catch (error) {
    
}




const buildUserPrompt=(intention,extractedContexts)=>{
    const sections=[intentionToWords(intention),chatToWords(extractedContexts.chat)].filter(Boolean)
      return sections.join("\n\n") +
    "\n\n위 정보를 토대로 호스트가 지금 즉시 말할 한 문장을 만들어라.";


}

const makeIntentionToWords=(intention)=>{
     return `[의도]
${intention.brief}
${intention.requiresNickname ? "* 멘트에 구체적 닉네임을 반드시 포함해라." : ""}`;
}

const makeChatToWords=(chat)=>{
    if(!chat || chat.count===0) return null 
    const activeUser=chat.frequency.activeUsers.map((u)=>`${u.nickName}이${u.count}회`).join(",")

    const keywordsToWord=chat.keywords,map((k)=>k.word).join(",")
    
    const originalChat=chat.original.slice(-8).join("\n")
    return `[채팅 상황]
    최근 ${chat.count}개 메세지,
    활발한 시청자:${activeUser||"없음"}
    화제 키워드:${keywordsToWord||"없음"}
    최근 채팅${originalChat}
    `
}
}
// };
// const buildUserPrompt = (context, intent) => {
//   const sections = [
//     formatIntent(intent),
//     formatChat(context.chat),
//   ].filter(Boolean);

//   return sections.join("\n\n") +
//     "\n\n위 정보를 토대로 호스트가 지금 즉시 말할 한 문장을 만들어라.";
// };