const path = require("path"); // path 모듈 가져오기
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
const { handleWebhook } = require("./webhook");
const bodyParser = require("body-parser");
const port = 3001;
const server = http.createServer(app);
// const routes = require("./routes");
//Middleware Setup
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "src")));
app.post("/payment/im_port", handleWebhook);

//Routes setup
// app.use("/", routes);

//Error handling
// app.use(errorHandler);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000/", // 허용할 clear도메인
    methods: ["GET", "POST"], // 허용할 메서드
    allowedHeaders: ["my-custom-header"], // 허용할 헤더
  },
});

const namespace_room = io.of("/room");

namespace_room.on("connection", (socket) => {
  console.log("일단 연결은 완성 ");
  socket.on("send_message", ({ message_info }) => {
    socket.emit("receive_message", message_info);
  });
  socket.on("send_streaming_viewer_presence", () => {});
});

server.listen(port, () => console.log(`server is running! ${port}`));
