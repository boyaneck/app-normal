import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { insertAllParti, insertAvgParti, insertTopParti } from "../api/live.js";
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
    if (event.event === "participant_joined") {
      await redis_client.sAdd(`${room_name}:live`, parti);
      const current_parti = await redis_client.sCard(`${room_name}:live`);
      await redis_client.incr(`${room_name}:count`);

      //최대 동시 시청자수
      await redis_client.hSet(
        `${room_name}:top_parti`,
        "top_parti",
        current_parti
      );
      const current_top_parti = await redis_client.hGet(
        `${room_name}:top_parti`,
        "top_parti"
      );

      if (
        !current_top_parti ||
        current_parti > parseInt(current_top_parti, 10)
      ) {
        await redis_client.hSet(
          `${room_name}:top_parti`,
          "top_parti",
          current_parti
        );
        console.log("동시접속자 수 업데이트", current_parti);
      }
      //최대 동시 시청자수

      //평균 시청 지속률
      const start_at = Date.now();
      await redis_client.hSet(`${room_name}:avg_viewer`, parti, start_at);
    } else if (event.event === "participant_left") {
      await redis_client.decr(`${room_name}:count`);
      console.log("참여자 디버깅:", event);

      //평균 시청 지속률
      const end_at = Date.now();
      const get_start_at = await redis_client.hGet(
        `${room_name}:avg_viewer`,
        parti
      );

      if (get_start_at) {
        const duration = Math.round((end_at - start_at) / 1000);
        await redis_client.rPush(`${room_name}:${parti}:duration`, duration);

        //시청 지속률
        conn_keep_rate = await redis_client.scan(
          `${room_name}:${parti}:duration`
        );
      }
    } else if (event.event === "room_finished") {
      console.log(`${room_name} 방 종료 `);

      //지속 유저들/전체 입장한 유저들 = 평균 지속률률
      const all_parti = await redis_client.sMembers(`${room_name}:live`);
      const rate = conn_keep_rate / all_parti;
    } else if (event.event === "ingress_ended") {
      res.status(200).send("Webhook을 성공적으로 받았습니다.");

      try {
        const get_all_parti = await redis_client.sMembers(`${room_name}:live`);
        const get_top_parti = await redis_client.hLen(`${room_name}:top_parti`);
        const get_avg_parti = await redis_client.lRange(
          `${room_name}:${parti}:duration`,
          0,
          -1
        );
      } catch (error) {}

      try {
        await insertAllParti(get_all_parti, room_name);
        await insertTopParti(get_top_parti, room_name);
        await insertAvgParti(get_avg_parti, room_name);
      } catch (error) {}
      // const get_chat_parti_ratio=await redis_client

      return;
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
