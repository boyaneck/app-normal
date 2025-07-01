const { redisClient } = require("../config/redis");

// const sanction_duration = {
//   "30m": 30,
//   "1h": 60,
//   "24h": 60 * 60 * 24,
//   permanent: -1,
// };

const sanctionChat = async (req, res) => {
  console.log("제재 관련 정보를 보냄", req.body.sanction_info);
  console.log("제재 관련 req body", req.body);

  const { user_id, streamer_id, duration, reason } = req.body;
  const subscriber = redisClient.duplicate();
  subscriber.subscribe();
  subscriber.subscribe(
    CHAT_CHANNEL,
    MODERATION_ACTION_CHANNEL,
    (err, count) => {
      if (err) {
        console.error("Failed to subscribe to Redis channels:", err);
        return;
      }
      console.log(`Subscribed to ${count} channels.`);
    }
  );

  subscriber.on("message", (channel, message) => {
    try {
      const parsed_msg = JSON.parse(message);
      if (channel === CHAT_CHANNEL) {
        console.log(`[Redis Pub/Sub] Received chat message:`, parsed_msg);
        if (io) {
        }
      } else if (channel === MODERATION_ACTION_CHANNEL) {
        console.log(`[Redis Pub/Sub] Received moderation action:`, parsed_msg);
        if (parsed_msg.type === "sanction" && parsed_msg.sanctionInfo) {
          const { streamer_id, user_id, reason, duration } =
            parsed_msg.sanctionInfo;
          console.log(
            `[Moderation] Received cross-server sanction for user ${user_id} in stream ${streamer_id}: ${reason} for ${duration} minutes.`
          );
          if (io) {
            io.to(`user-${user_id}`).emit("moderation:sanctionApplied", {
              streamer_id,
              user_id,
              reason,
              duration,
              message: `You have been sanctioned by a moderator for ${reason}. Duration: ${
                duration === -1 ? "Permanent" : `${duration} minutes`
              }.`,
            });
            io.to(`streamer-${streamer_id}`).emit("moderation:userSanctioned", {
              streamer_id,
              user_id,
              reason,
              duration,
              message: `User ${user_id} has been sanctioned in your stream.`,
            });
          }
        } else if (
          parsed_msg.type === "sanction_lifted" &&
          parsed_msg.sanctionInfo
        ) {
          const { streamer_id, user_id } = parsed_msg.sanctionInfo;
          console.log(
            `[Moderation] Received cross-server sanction lifted for user ${user_id} in stream ${streamer_id}.`
          );
          if (io) {
            io.to(`user-${user_id}`).emit("moderation:sanctionLifted", {
              streamer_id,
              user_id,
              message: `Your sanction has been lifted.`,
            });
            io.to(`streamer-${streamer_id}`).emit(
              "moderation:userSanctionLifted",
              {
                streamer_id,
                user_id,
                message: `User ${user_id}'s sanction has been lifted in your stream.`,
              }
            );
          }
        }
      }
    } catch (e) {
      console.error("Error parsing Redis Pub/Sub message:", e);
    }
  });

  // try {

  //   if(!streamer_id||!user_id||!reason||!duration){
  //     return res.status(400).json({message:"필수정보가 누락되었습니다."})
  //   }

  //   const key=`sanction${streamer_id}:${user_id}`
  //   const value=`${reason}:${duration}`

  //   if(duration ===-1){

  //     await redis_client.set(key)
  //     console.log(`스트리머${streamer_id}방송의 유저${user_id}를 영구 금지합니다`)
  //   }
  //   else if(duration>0){
  //     await redis_client.set(key, "EX", duration);
  //   }
  //   const redis_key=JSON.stringify({
  //     reason,
  //     duration,
  //     start_at: new Date().toISOString()
  //   })
  // } catch (error) {}
};

module.exports = sanctionChat;
