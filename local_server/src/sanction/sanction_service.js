const { SupabaseClient } = require("@supabase/supabase-js");

const { redis_client } = require();

const sanctionService = async (
  io,
  redis_client,
  channel_id,
  user_id,
  duration,
  reason,
  socket
) => {
  const duration_seconds = duration * 60;
  const sanction_key = `sacntion_channel:${channel_id},user_id:${user_id}`;

  //redis와 상관없이 supabase에는 기록용으로 남기기 위함
  const { data, error } = await SupabaseClient.from("sanction_logs").insert({
    user_id,
    user_nickname,
    reason,
    duration,
  });

  if (duration > 0) {
    const expired = new Date(Date.now() + duration_seconds);

    const sanction_data = JSON.stringify({
      reason,
      expired: expired.toISOString(),
    });

    await redis_client.setEx(sanction_key, duration_seconds, sanction_data);
    io.emit();

    await redis_client.del(sanction_key);

    //제재 해제 알림
    io.to(`channel:${channel_id}`).emit("ban_expired", {
      message: `사용자${user_id}님의 채팅금지가 해제 되었습니다`,
    });
  }

  //영구적인 강퇴는 duration을 "null"으로 처리
  if (duration === null) {
  }

  //  await redis_client.setEx

  //     return { type: 'ban', ...ban_record };
  //   }

  if (duration > 0) {
  }

  return "유저가 성공적으로 제재되었습니다✔️";
};
module.exports = sanctionService;
