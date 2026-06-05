const makeContext = async (roomName, event, sample) => {
  const [chat, reference, hostMetaData] = await Promise.all([
    makeChatContext(roomName),
    getHostMetaData(roomName),
  ]);

  return {
    event:
  };
};



const METRIC_KOR={
  donation:"후원",
  chat:"채팅",
  viewer:"시청자"
}



export const ss=(event)=>{
const metricName=METRIC_KOR[event.metric] ?? event.metric
const times= event.z.toFixed(1)
const direction=event.slope>0? "증가":"감소"

return{
  metric:event.metric,
  z:event.z,
  direction:event.slope
}
}