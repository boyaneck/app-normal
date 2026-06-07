import { redis_client } from "../../config/redis";
import { getRedisKeys } from "../../live/redis-keys";




const WINDOW_MS=60*1000
const METRIC_KOR={
  donation:"후원",
  chat:"채팅",
  viewer:"시청자"
}


const makeContext = async (roomName, event, metric) => {
  const [chat, reference, hostMetaData] = await Promise.all([
    makeChatContext(roomName),
    getHostMetaData(roomName),
  ]);

  return {
    event:
  };
};






export const ss=(event)=>{
const metricName=METRIC_KOR[event.metric] ?? event.metric
const times= event.z.toFixed(1)
const direction=event.slope>0? "증가":"감소"

return{
  metric:event.metric,
  z:event.z,
  direction:event.slope
}


//채팅 문맥 분석-원문에서 구조를 추출
const makeChatContext=async(roomName)=>{
 const kyes=getRedisKeys(roomName)
 const now=Date.now()

 const chatRawData=await redis_client.zRange(
  kyes.CHAT_TIMESERIES,
  now-WINDOW_MS,
  now,{BY:"SCORE"}
 )

 const msg=chatRawData
}
}