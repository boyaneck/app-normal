const { SupabaseClient } = require("@supabase/supabase-js");
const { redis_client } = require("../config/redis");

const sanctionRecord = async (user_id, user_nickname, duration, reason) => {
  const { data, error } = await SupabaseClient.from("sanction_logs").insert({
    user_id,
    user_nickname,
    duration,
    reason,
  });

  if (error) {
    //redis_key 필요
    //DB저장 실패시 , Transaction 처리를 위해 해당 데이터를 Redis에 기록하기전으로 rollback
    await redis_client.del(redis_key);
    throw new Error(`Supabase DB에 제재 기록을 삽입하는데 실패하였습니다!🚀`);
  }
};
