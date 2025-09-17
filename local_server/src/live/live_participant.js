import { WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
const redis_client_for_livekit = redis_client;
export const liveParticipantWebhook = async (req, res) => {
  const api_key = process.env.LIVEKIT_API_KEY;
  const api_secret = process.env.LIVEKIT_API_SECRET;

  const receiver = new WebhookReceiver(api_key, api_secret);
  try {
    // req.body가 Buffer 타입이므로, WebhookReceiver에 그대로 전달합니다.
    // get('Authorization') 대신 headers.authorization을 사용합니다.

    //최대 동시 시청자 수
    const event = receiver.receive(req.body, req.get("Authorization"));
    const room_name = event.room.name;
    const parti = event.participant.identity;
    console.log("받기", event);
    const redis_parti_key = `${room_name}:live`;
    const redis_top_parti_key = `${room_name}:top_parti`;

    if (event.event === "participant_joined") {
      await redis_client_for_livekit.sAdd(redis_parti_key, parti);
      const current_parti = await redis_client_for_livekit.sCard(
        redis_parti_key
      );
      await redis_client_for_livekit.hSet(
        redis_top_parti_key,
        "top_parti",
        current_parti
      );
      const current_top_parti = await redis_client_for_livekit.hGet(
        redis_top_parti_key,
        "top_parti"
      );

      if (
        !current_top_parti ||
        current_parti > parseInt(current_top_parti, 10)
      ) {
        await redis_client_for_livekit.hSet(
          redis_parti_key,
          "top_parti",
          current_parti
        );
        console.log("동시접속자 수 업데이트", current_parti);
      }
    } else if (event.event === "participant_left") {
      console.log("참여자 디버깅:", event);
      await redis_client_for_livekit.sRem(redis_parti_key, parti);
    }
    // ✅ 성공 응답을 보내야 합니다.
    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    // ✅ 에러 응답을 보내야 합니다.
    console.error("Webhook 처리 실패:", error);
    res.status(400).send("Bad request.");
  }
};
