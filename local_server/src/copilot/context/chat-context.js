import { redis_client } from "../../config/redis";
import { getRedisKeys } from "../../live/redis-keys";

const RECENT_MS=60*1000
const MIN_MSG_RECOGNIZED_LENGTH=2
const TOP_USERS=3
const TOP_KEYWORDS=5
const ORIGINAL_MSG_COUNT=15

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




    const getChat= async(roomName)=>{
    const keys=getRedisKeys(roomName)
    const now=Date.now()


    const rawMsgDatas=await redis_client.zRange()
    }


}
