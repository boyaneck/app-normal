import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;
const receiver = new WebhookReceiver(api_key, api_secret);
let conn_keep_rate;
export const liveParticipantWebhook = async (req, res) => {
  try {
    // req.body가 Buffer 타입이므로, WebhookReceiver에 그대로 전달합니다.
    // get('Authorization') 대신 headers.authorization을 사용합니다.

    //최대 동시 시청자 수
    const event = receiver.receive(req.body, req.get("Authorization"));
    const room_name = event.room.name;
    const parti = event.participant.identity;
    const redis_parti_key = `${room_name}:live`;
    const redis_top_parti_key = `${room_name}:top_parti`;
    const redis_avg_viewer_key = `${room_name}:avg_viewer`;
    const redis_duration_key = `${room_name}:${parti}:duration`;
    if (event.event === "participant_joined") {
      await redis_client.sAdd(redis_parti_key, parti);
      const current_parti = await redis_client.sCard(redis_parti_key);
      await redis_client.hSet(redis_top_parti_key, "top_parti", current_parti);
      const current_top_parti = await redis_client.hGet(
        redis_top_parti_key,
        "top_parti"
      );

      if (
        !current_top_parti ||
        current_parti > parseInt(current_top_parti, 10)
      ) {
        await redis_client.hSet(redis_parti_key, "top_parti", current_parti);
        console.log("동시접속자 수 업데이트", current_parti);
      }

      //평균 시청 지속률
      const start_at = Date.now();
      await redis_client.hSet(redis_avg_viewer_key, parti, start_at);
    } else if (event.event === "participant_left") {
      console.log("참여자 디버깅:", event);

      //평균 시청 지속률
      const end_at = Date.now();
      const get_start_at = await redis_client.hGet(redis_avg_viewer_key, parti);

      if (get_start_at) {
        const duration = Math.round((end_at - start_at) / 1000);
        await redis_client.rPush(redis_duration_key, duration);

        //시청 지속률
        conn_keep_rate = await redis_client.scan(redis_duration_key);
      }
    } else if (event.event === "room_finished") {
      console.log(`${room_name} 방 종료 `);

      //지속 유저들/전체 입장한 유저들 = 평균 지속률률
      const all_parti = await redis_client.sMembers(redis_parti_key);
      const rate = conn_keep_rate / all_parti;
    } else if (event.event === "ingress_ended") {
      //redis에 저장된 해당 관련 방송 데이터들을 다 supabase 저장하기
      await redis_client;
      //저장된 supabase의 데이터들을 가져와서 스트리머의 화면에 보여주기기
    }
    // ✅ 성공 응답을 보내야 합니다.
    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    // ✅ 에러 응답을 보내야 합니다.
    console.error("Webhook 처리 실패:", error);
    res.status(400).send("Bad request.");
  }
};
