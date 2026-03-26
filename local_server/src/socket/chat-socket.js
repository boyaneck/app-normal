import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/live-webhook.js";

// Rate Limiting
const RATE_LIMIT = {
  maxMsg: 3,
  windowSec: 1,
  ttlSec: 2,
};

const chkMsgLimitSec = async (id) => {
  try {
    const key = `limitSec:${id}:${Math.floor(Date.now() / 1000)}`;
    const count = await redis_client.incr(key);
    if (count === 1) await redis_client.expire(key, RATE_LIMIT.ttlSec);
    return { allowed: count <= RATE_LIMIT.maxMsg, count };
  } catch (error) {
    return { allowed: true, count: 0 };
  }
};

// XSS 방지
const escapeHTML = (str) => {
  if (typeof str !== "string") return str;
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return str.replace(/[&<>"']/g, (text) => map[text]);
};

export const chatSocket = (socket, namespaceRoom) => {
  // 방 입장
  socket.on("join_room", async ({ hostId }) => {
    try {
      socket.join(hostId);

      // 놓친 메시지 복구 (최근 50개)
      const redisKey = getRedisKeys(hostId);
      const recentMsg = await redis_client.lRange(redisKey.MSG, 0, 49);

      if (recentMsg.length > 0) {
        const msgList = recentMsg.map((m) => JSON.parse(m));
        socket.emit("msg_history", { msgList });
      }

      console.log(`유저가 ${hostId}방에 입장하였습니다.`);
    } catch (error) {
      console.error("방 입장 오류:", error.message);
      socket.emit("error_event", { msg: "방 입장에 실패했습니다." });
    }
  });

  // 메시지 수신 + 처리 + 브로드캐스트
  socket.on("send_msg", async ({ msgInfo }) => {
    try {
      const userId = msgInfo.id;
      const hostId = msgInfo.hostId;

      // Rate Limiting
      const rateCheck = await chkMsgLimitSec(userId);
      if (!rateCheck.allowed) {
        socket.emit("msg_rejected", {
          reason: "rateLimit",
          msg: "메시지를 너무 빠르게 보내고 있습니다.",
        });
        return;
      }

      // XSS 이스케이프 + 서버 타임스탬프 + 고유 ID
      const safeMsg = {
        ...msgInfo,
        msg: escapeHTML(msgInfo.msg),
        userNickname: escapeHTML(msgInfo.userNickname),
        serverTimestamp: Date.now(),
        msgId: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      // 방 전체에 브로드캐스트
      namespaceRoom.to(hostId).emit("receive_msg", safeMsg);

      // Redis에 메시지 저장 (복구용 + 데이터)
      const redisKey = getRedisKeys(hostId);
      await redis_client.rPush(redisKey.MSG, JSON.stringify(safeMsg));
      await redis_client.lTrim(redisKey.MSG, -50, -1);
      await redis_client.expire(redisKey.MSG, 60 * 60 * 24);
    } catch (error) {
      console.error("메시지 전송 오류:", error.message);
      socket.emit("error_event", {
        msg: "메시지 전송 중 오류가 발생했습니다.",
      });
    }
  });

  // 연결 해제
  socket.on("disconnect", async (reason) => {
    console.log(`유저 퇴장 (사유: ${reason})`);
  });
};
