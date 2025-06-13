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
const initialize_socket = require("./socket/index");
const sanctionChat = require("./sanction/sanction_chat");
// const routes = require("./routes");
//Middleware Setup
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "src")));
app.post("/payment/im_port", handleWebhook);
app.post("/sanction_chat", sanctionChat);
initialize_socket(server);

//Routes setup
// app.use("/", routes);

//Error handling
// app.use(errorHandler);

server.listen(port, () => console.log(`server is running! ${port}`));
