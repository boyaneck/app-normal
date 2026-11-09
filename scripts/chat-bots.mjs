// 채팅 부하 테스트용 봇 스크립트
// 가짜 사용자 N명이 채팅방에 들어와 주기적으로 메시지를 보내고, 전송/수신/지연 시간을 집계한다.
//
// 사용법 (프로젝트 루트에서):
//   HOST_ID=<방송방 hostId> node scripts/chat-bots.mjs
//   HOST_ID=abc BOTS=100 RATE=1 DURATION=60 node scripts/chat-bots.mjs
//
// 환경변수
//   SERVER_URL  기본 http://localhost:3001  (배포 서버에 돌리면 Redis/Groq 비용이 생기니 로컬 권장)
//   HOST_ID     필수. 테스트할 방송방의 hostId (방송 페이지 URL의 id)
//   BOTS        봇 수 (기본 50)
//   RATE        봇 1명이 초당 보내는 메시지 수 (기본 0.5 = 2초에 1개)
//   DURATION    테스트 시간(초) (기본 60)
//   RAMP_MS     봇 접속 간격(ms) (기본 50) — 한꺼번에 몰리지 않게 순차 접속

import { io } from "socket.io-client";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3001";
const HOST_ID = process.env.HOST_ID;
const BOTS = Number(process.env.BOTS ?? 50);
const RATE = Number(process.env.RATE ?? 0.5);
const DURATION_SEC = Number(process.env.DURATION ?? 60);
const RAMP_MS = Number(process.env.RAMP_MS ?? 50);

if (!HOST_ID) {
  console.error("HOST_ID 환경변수가 필요합니다. 예) HOST_ID=abc node scripts/chat-bots.mjs");
  process.exit(1);
}

const stats = {
  connected: 0,
  connectErrors: 0,
  disconnects: 0,
  sent: 0,
  received: 0,
  rejected: 0,
  serverErrors: 0,
  latencies: [], // 수신 시점 - 전송 시점 (ms)
};

const sockets = [];
const timers = [];

const percentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
};

const createBot = (i) => {
  const socket = io(`${SERVER_URL}/chat`, {
    transports: ["websocket"],
    reconnection: true,
  });
  sockets.push(socket);

  socket.on("connect", () => {
    stats.connected++;
    socket.emit("join_room", { hostId: HOST_ID });

    const timer = setInterval(() => {
      socket.emit("send_msg", {
        msgInfo: {
          id: `bot-${i}`,
          userNickname: `봇${i}`,
          email: "",
          msg: `봇${i}의 메시지 ${stats.sent}`,
          hostId: HOST_ID,
          chatRoomNum: HOST_ID,
          date: new Date().toISOString(),
          botSentAt: Date.now(), // 서버가 msgInfo를 그대로 펼쳐서 돌려주므로 지연 측정에 사용
        },
      });
      stats.sent++;
    }, 1000 / RATE);
    timers.push(timer);
  });

  socket.on("receive_msg", (msg) => {
    stats.received++;
    // 모든 수신을 다 기록하면 배열이 너무 커지므로 0번 봇 기준으로만 지연 측정
    if (i === 0 && msg.botSentAt) stats.latencies.push(Date.now() - msg.botSentAt);
  });

  socket.on("msg_rejected", () => stats.rejected++);
  socket.on("error_event", () => stats.serverErrors++);
  socket.on("connect_error", () => stats.connectErrors++);
  socket.on("disconnect", () => {
    stats.connected--;
    stats.disconnects++;
  });
};

const printStats = (label) => {
  // 이론상 수신 수 = 전송 수 × 방에 있는 봇 수 (브로드캐스트 팬아웃)
  console.log(
    `[${label}] 접속 ${stats.connected}/${BOTS} | 전송 ${stats.sent} | 수신 ${stats.received} | ` +
      `거부 ${stats.rejected} | 서버에러 ${stats.serverErrors} | 접속실패 ${stats.connectErrors} | 끊김 ${stats.disconnects} | ` +
      `지연 p50 ${percentile(stats.latencies, 50)}ms p95 ${percentile(stats.latencies, 95)}ms max ${percentile(stats.latencies, 100)}ms`,
  );
};

console.log(
  `▶ ${SERVER_URL} / 방 ${HOST_ID} / 봇 ${BOTS}명 / 1명당 초당 ${RATE}개 / ${DURATION_SEC}초`,
);
console.log(`  예상 부하: 초당 전송 ${BOTS * RATE}개 → 초당 수신(팬아웃) 약 ${BOTS * RATE * BOTS}개`);

for (let i = 0; i < BOTS; i++) {
  setTimeout(() => createBot(i), i * RAMP_MS);
}

let elapsed = 0;
const reporter = setInterval(() => {
  elapsed += 5;
  printStats(`${elapsed}s`);
}, 5000);

setTimeout(() => {
  clearInterval(reporter);
  timers.forEach(clearInterval);
  printStats("최종");
  sockets.forEach((s) => s.close());
  process.exit(0);
}, DURATION_SEC * 1000 + BOTS * RAMP_MS);
