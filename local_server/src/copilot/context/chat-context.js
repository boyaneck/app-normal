const TOP_USERS = 3;
const TOP_KEYWORDS = 5;
const STOP_WORDS =new Set([
"이거", "그거", "저거", "이건", "그건",
  "지금", "진짜", "그냥", "조금", "완전",
  "오늘", "어제", "내일", "근데", "그래서",
])



const makeChatContext=async(roomName)=>{

    const msgs=await getChat(roomName)
    if(msgs.length===0) return 

    const frequency= extractFrequency(msgs)
    const keywords=extractKeywords(msgs)
    const textStates=extractTextStats(msgs)
    const originalMsg=extractOriginalMsg(msgs)


    return {
        msgCount=msgs.length,
        frequency,
        keywords,
        textStates,
        originalMsg
    }



const extractFrequency=(msgs)=>{

    const userCount={}
    for(const msg of msgs){
        userCount[msg.nickName]=(userCount[msg.nickName]||0) +1
    }

    const activeUsers=Object.entries(userCount).sort((a,b)=>b[1]-a[1]).slice(0,TOP_USERS).map(([userNickname,count])=>{userNickname,count})

 return {
    activeUsers,
    uniqueUsers:Object.keys(userCount).length
 }

 const extractKeywords=(msgs)=>{
   const wordCount={}
   for(const msg of msgs){
    const words=msg.msg.split(/\s+/).filter((word)=>word.length>= 2 && !STOP_WORDS.has(word))
   }


   return Object.entries(wordCount).filter(([,count])=>count >=2).sort((a,b)=>b[1]-a[1]).slice(0,TOP_KEYWORDS).map(([word,count])=>({word,count}))

 }



 const extractChatStats=(msgs)=>{
    const total=msgs.length
  if (total === 0) {
    return { avgLength: 0, exclamationRate: 0, laughterRate: 0, questionRate: 0 };
  }

  let totalLength = 0;
  let exclamationCount = 0;
  let laughterCount = 0;
  let questionCount = 0;

  for (const m of msgs) {
    totalLength += m.message.length;
    if (m.message.includes("!")) exclamationCount++;
    if (/[ㅋㅎ]/.test(m.message)) laughterCount++;
    if (m.message.includes("?")) questionCount++;
  }

  return {
    avgLength: Number((totalLength / total).toFixed(1)),
    exclamationRate: Number((exclamationCount / total).toFixed(2)),
    laughterRate: Number((laughterCount / total).toFixed(2)),
    questionRate: Number((questionCount / total).toFixed(2)),
  };
 }
}





}
