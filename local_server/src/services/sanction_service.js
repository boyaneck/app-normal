const {rediscl}=require()

const sanctionService = async(io,redis_client,channel_id,user_id,duration,reason,socket) => {

    const duration_seconds=duration*60

    if(duration>0){
        const sanction_key=`sacntion_channel:${channel_id},user_id:${user_id}`
        const expried=new Date(Date.now()+duration_seconds)

        const sanction_data=JSON.stringify({
            reason,
            expired:expired.toISOString()
        })

        await redis_client.setEx(sanction_key,duration_seconds,sanction_data)
        io.emit()


        await redis_client.del(sanction_key)

        //제재 해제 알림
        io.to(`channel:${channel_id}`).emit('ban_expired',{
            message:`사용자${user_id}님의 채팅금지가 해제 되었습니다`
        })
    }


    //영구적인 강퇴는 duration을 "0"으로 처리
    if(duration===0){
        const {}
    }
    const subscriber = redisClient.duplicate();
    subscriber.subscribe(
      CHAT_CHANNEL,
      MODERATION_ACTION_CHANNEL,
      (err, count) => {
        if (err) {
          console.error("Redis 채널에 등록이 실패함", err);
          return;
        }
        console.log(`Subscribed to ${count} channels.`);
      }
    );
  
    subscriber.on("message", (channel, message) => {
      try {
        const parsed_msg = JSON.parse(message);
        if (channel === CHAT_CHANNEL) {
          console.log(`Redis pub/sub 메세지 `, parsed_msg);
          if (io) {
          }
        } else if (channel === MODERATION_ACTION_CHANNEL) {
          console.log(`Redis pub/sub moderation `, parsed_msg);
          if (parsed_msg.type === "sanction" && parsed_msg.sanctionInfo) {
            const { streamer_id, user_id, reason, duration } =
              parsed_msg.sanctionInfo;
            console.log(
              `moderation ${user_id}  ${streamer_id}: ${reason}  ${duration} 동안안`
            );
            if (io) {
              io.to(`user-${user_id}`).emit("moderation:sanctionApplied", {
                streamer_id,
                user_id,
                reason,
                duration,
                message: ` ${reason} 의 이유로 ${
                  duration === -1 ? "영구" : `${duration} 분 덩인 제재 되었습니다.`
                }.`,
              });
              io.to(`-${streamer_id}`).emit("moderation:", {
                streamer_id,
                user_id,
                reason,
                duration,
                message: ` ${user_id} 가 해당 스트리머의 방송에서 채팅을 제재당함함`,
              });
            }
          } else if (
            parsed_msg.type === "sanction_lifted" &&
            parsed_msg.sanctionInfo
          ) {
            const { streamer_id, user_id } = parsed_msg.sanctionInfo;
            console.log(
              `${user_id} in stream ${streamer_id}.`
            );
            if (io) {
              io.to(`user-${user_id}`).emit("moderation:sanctionLifted", {
                streamer_id,
                user_id,
                message: ,
              });
              io.to(`streamer-${streamer_id}`).emit(
                "",
                {
                  streamer_id,
                  user_id,
                  message: ` ${user_id} 님이 제재 당했습니다.`,
                }
              );
            }
          }
        }
      } catch (e) {
        console.error("Error parsing Redis Pub/Sub message:", e);
      }
    });
  
 const sanction_key=`sanction${channel_id}:${user_id}`
 const expired=new Date(Date.now()+duration_seconds)


 await redis_client.setEx

    return { type: 'ban', ...ban_record };
  }




    

    const expired=new Date(Date.now()+duration*60*1000) 

    if(duration>0){

    }



    return  "유저가 성공적으로 제재되었습니다✔️"

}
module.exports = sanctionService;
