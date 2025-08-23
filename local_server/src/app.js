import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const port = 3001;

// 미들웨어 설정
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "src")));

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "src")));
app.post("/payment/im_port", handleWebhook);
app.post("/sanction_chat", sanctionChat);

app.use("/live", live_route);

initialize_socket(server);
//Routes setup
// app.use("/", routes);

//Error handling
// app.use(errorHandler);
server.listen(port, () => console.log(`server is running! ${port}`));
