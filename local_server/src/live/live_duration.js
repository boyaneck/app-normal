import { RoomServiceClient, WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";
const redis_client_for_livekit = redis_client;
export const livekitWebhook = async (req, res) => {
  const api_key = process.env.LIVEKIT_API_KEY;
  const api_secret = process.env.LIVEKIT_API_SECRET;
  const livekit_url = process.env.LIVEKIT_URL;

  const room_service = new RoomServiceClient(livekit_url, api_key, api_secret);
  const receiver = new WebhookReceiver(api_key, api_secret);

  try {
    //데이터 무결성을 check 한 뒤, buffer형태의 데이터를 json 객체로 변환
    const event = receiver.receive(req.body, req.get("Authorization"));
    const room_name = event.room.name;
    const redis_key = `${room_name}의 방송`;
    if (event.event === "track_published") {
      console.log("redis client 데이터 넣기 시작");
      const room_exist = await redis_client_for_livekit.hSetNX(
        redis_key,
        event.participant?.identity,
        `${Date.now()}`
      );
      console.log(
        `🚀 Redis 저장  '${room_name}'의 방송 정보가 새롭게 저장되었습니다.`
      );
      ㄹ;
      if (room_exist === 1) {
      } else if (room_exist === 0) {
        console.log(`🔥이미 존재하는 데이터가 있습니다`);
      }
    }
    //해당 데이터가 있을경우 그 다음 로직
    if (event.event === "room_finished") {
      const del = await redis_client.del(redis_key);
      console.log(`🗑️ Redis 삭제 ${redis_key}의 방송 정보가 삭제되었습니다.`);
      console.log("방송 종료");
    }
    res.status(200).send("Webhook processed successfully.");
    console.log("마무리 코드 작동됨");
  } catch (error) {
    console.error("🔥 웹훅 처리 중 심각한 오류 발생:", error.message, error);

    // 실패 시, LiveKit 서버에 오류가 발생했음을 알림
    res.status(400).send(`Error processing webhook: ${error.message}`);
  }
};
