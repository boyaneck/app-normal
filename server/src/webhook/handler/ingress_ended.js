// import { parse } from "dotenv"
// import { redis_client } from "../../config/redis"

// export const ingressEnded=async(event,room_name)=>{

//     try {
//         console.log("ingressEnded 로직 시작")
//         await redis_client.rPush(`ingress_ended:${room_name}`,event)

//         /
//         while(true){
//             const res=await redis_client.blPop(`ingress_ended:${room_name}`,0)
//             if(!res) continue

//         }
//         const parti_count=await redis_client.sCard(`${room_name}:live`)
//         const top_parti_count=await redis_client.hGet(`${room_name}:top_parti`)
//         const top_parti_count_int=top_parti_count? parseInt(top_parti_count,10):0
//     } catch (error) {

//     }

// }
