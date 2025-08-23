import dotenv from "dotenv";
import { RoomServiceClient, WebhookReceiver } from "livekit-server-sdk";
import { redis_client } from "../config/redis.js";

const redis_client_for_livekit = redis_client;
export const livekitWebhook = async (req, res) => {
  const api_key = process.env.LIVEKIT_API_KEY;
  const api_secret = process.env.LIVEKIT_API_SECRET;
  const livekit_url = process.env.LIVEKIT_URL;

  const room_service = new RoomServiceClient(livekit_url, api_key, api_secret);
  const receiver = new WebhookReceiver(api_key, api_secret);
  console.log("이노우에 나오야", livekit_url, api_key, "dd0", api_secret);

  try {
    //데이터 무결성을 check 한 뒤, buffer형태의 데이터를 json 객체로 변환
    const event = receiver.receive(req.body, req.get("Authorization"));
    console.log("event.room", event.room);
    const room_name = event.room.name;
    const redis_key = `stream${room_name}`;
    if (event.event === "track_published") {
      //첫 스트리밍 시작일 경우
      console.log("track published 일 경우만 ");
      const room_exist = await redis_client_for_livekit.exists(redis_key);

      if (room_exist === 0) {
        const stream_data = {
          start_time: Date.now(),
          streamer_id: event.participant?.identity,
          status: "LIVE",
        };
        await redis_client.set(redis_key, JSON.stringify(stream_data));

        console.log(
          `🚀 Redis 저장  '${room_name}'의 방송 정보가 저장되었습니다.`
        );
      }
    }
    //방송이 끝났다면
    else if (event.event === "room_finished") {
      const del = await redis_client.del(redis_key);
      if (del > 0) {
        console.log(
          `🗑️ Redis 삭제 '${room_name}'의 방송 정보가 삭제되었습니다.`
        );
      }
      console.log("방송 종료");
    }
  } catch (error) {
    console.error("🔥 웹훅 처리 중 심각한 오류 발생:", error.message, error);

    // 실패 시, LiveKit 서버에 오류가 발생했음을 알림
    res.status(400).send(`Error processing webhook: ${error.message}`);
  }
};
