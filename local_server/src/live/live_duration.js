import bodyParser from "body-parser";
import { redis_client } from "../config/redis";

require("dotenv").config();
const { RoomServiceClient, WebhookReceiver } = require("livekit-server-sdk");

const livekit_URL = process.env.LIVEKIT_URL;
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;

const redis_client_for_livekit = redis_client;
const room_service = new RoomServiceClient(livekit_URL, api_key, api_secret);
const receiver = new WebhookReceiver(api_key, api_secret);
export const livekitWebhook = async (req, res) => {
  try {
    //데이터 무결성을 check 한 뒤, buffer형태의 데이터를 json 객체로 변환
    const event = receiver.receive(req.body, req.get("Authorization"));
    const room_name = event.room.name;
    const redis_key = `stream${room_name}`;
    if (event.event === "track published") {
      //첫 스트리밍 시작일 경우
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
    console.error("🔥 웹훅 처리 중 심각한 오류 발생:", error.message);

    // 실패 시, LiveKit 서버에 오류가 발생했음을 알림
    res.status(400).send(`Error processing webhook: ${error.message}`);
  }
};
