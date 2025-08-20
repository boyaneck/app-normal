import bodyParser from "body-parser";

require("dotenv").config();
const { RoomServiceClient, WebhookReceiver } = require("livekit-server-sdk");

const livekit_URL = process.env.LIVEKIT_URL;
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;

const room_service = new RoomServiceClient(livekit_URL, api_key, api_secret);
const receiver = new WebhookReceiver(api_key, api_secret);
const each_streaming_state = new Map();
export const livekitWebhook = async (req, res) => {
  try {
    //데이터 무결성을 check 한 뒤, buffer형태의 데이터를 json 객체로 변환
    const event = receiver.receive(req.body, req.get("Authorization"));
    if (event.event === "track published") {
      //첫 스트리밍 시작일 경우
      if (!each_streaming_state.has(event.room?.name)) {
        each_streaming_state.set(event.room?.name, { start_time: Date.now() });
      }
    }
    //방송이 끝났다면
    else if (event.event === "room_finished") {
      each_streaming_state.delete(event.room?.name);
      console.log("방송 종료");
    }
  } catch (error) {}
};
