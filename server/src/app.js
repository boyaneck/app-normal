import "./config/env_loader.js";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import bodyParser from "body-parser";

import { initializeSocket } from "./socket/index.js";
import { sanctionChat } from "./sanction/sanction_chat.js";
import { livekitWebhook } from "./live/live_duration.js";

import { connectRedis } from "./config/redis.js";
import liveRouter from "./routes/live-route.js";
import AIRouter from "./routes/ai-route.js";
import paymentRouter from "./routes/payment-route.js";
import { getLiveRoomNames } from "./live/live-status.js";
import { startCopilotLoop } from "./copilot/loop.js";
import { startTimeseriesRecording } from "./live/timeseries.js";
// import routes from "./routes.js"; // .js 확장자 추가

// ES 모듈에는 __dirname이 없으므로 아래와 같이 정의합니다.

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors());

// PortOne 웹훅은 서명 검증에 raw body가 필요하므로 전역 JSON 파서보다 먼저 마운트한다
app.use("/payment", paymentRouter);

app.use(bodyParser.json());

app.post("/sanction_chat", sanctionChat);
app.use("/live", liveRouter);
app.use("/ai", AIRouter);

initializeSocket(server);

/**
 * 서버 재시작 복구
 * 코파일럿/시계열 루프는 메모리(setInterval)에 있어서, 방송 도중 서버가 재시작되면(Render 재배포, 슬립)
 * 사라지고 ingress_started 웹훅이 다시 오지 않는 한 영영 안 켜졌다.
 * → 켜질 때 status = 'live'인 방송의 루프를 다시 시작한다.
 */
const resumeLiveLoops = async () => {
  const rooms = await getLiveRoomNames();
  for (const roomName of rooms) {
    startCopilotLoop(roomName);
    startTimeseriesRecording(roomName);
  }
  if (rooms.length) console.log(`[Resume] 방송 중인 ${rooms.length}개 방의 루프 복구`);
};

const startServer = async () => {
  try {
    await connectRedis();
    server.listen(port, () => {});
    resumeLiveLoops().catch((err) => console.error("[Resume] 루프 복구 실패:", err.message));
  } catch (error) {
    console.error(
      "🔥 서버 시작에 실패했습니다. Redis URL 등 설정을 확인하세요:",
      error,
    );
    process.exit(1);
  }
};
startServer();
