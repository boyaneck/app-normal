require("dotenv").config();
const { RoomServiceClient, WebhookReceiver } = require("livekit-server-sdk");

const livekit_URL = process.env.LIVEKIT_URL;
const api_key = process.env.LIVEKIT_API_KEY;
const api_secret = process.env.LIVEKIT_API_SECRET;

const roomService = new RoomServiceClient(livekit_URL, api_key, api_secret);
const receiver = new WebhookReceiver(api_key, api_secret);

const livekitWebhook = async (req, res) => {
  try {
    const start_time = receiver.receive(req.body, req.get("Authorization"));

    if (start_time === "track published") {
      console.log();

      const room = await roomService.listRooms([start_time.room.name]);
      if (room.length === 0) {
        throw new Error("해당 룸을 찾을 수 없습니다.");
      }
    }
  } catch (error) {}
};
