import "./config/env_loader.js";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import bodyParser from "body-parser";

import { handleWebhook } from "./webhook.js";
import { initialize_socket } from "./socket/index.js";
import { sanctionChat } from "./sanction/sanction_chat.js";
import { livekitWebhook } from "./live/live_duration.js";
import live_route from "./routes/live_route.js";
import { connectRedis } from "./config/redis.js";
// import routes from "./routes.js"; // .js 확장자 추가

// ES 모듈에는 __dirname이 없으므로 아래와 같이 정의합니다.

const app = express();
const server = http.createServer(app);
const port = 3001;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(cors());

app.post("/payment/im_port", handleWebhook);
app.post("/sanction_chat", sanctionChat);

app.use("/live", live_route);

initialize_socket(server);
//Routes setup
// app.use("/", routes);

//Error handling
// app.use(errorHandler);
// server.listen(port, () => console.log(`server is running! ${port}`));

const startServer = async () => {
  try {
    await connectRedis();
    server.listen(port, () => {
      console.log(`✅ 서버가 ${port}번 포트에서 정상적으로 실행되었습니다.`);
    });
  } catch (error) {
    console.error(
      "🔥 서버 시작에 실패했습니다. Redis URL 등 설정을 확인하세요:",
      error
    );
    process.exit(1);
  }
};
startServer();
