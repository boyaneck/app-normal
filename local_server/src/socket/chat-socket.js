import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";
import { detectChatSpike } from "../chat/chat-spike-detector.js";

/**
 * [확장성 설계]
 * - 브로드캐스트 우선: Redis 대기 없이 메시지를 즉시 전송 후 저장은 비동기 처리
 * - Graceful Degradation: Redis 장애 시에도 실시간 채팅은 정상 동작
 * - 수평 확장 대비: @socket.io/redis-adapter 연결 시 다중 서버 인스턴스 지원 가능
 *   (적용 방법: io.adapter(createAdapter(pubClient, subClient)))
 * - 채팅 전환율(intoChatRate): CHAT_UNIQUE_USERS Set으로 방송 종료 시 계산
 */

// Rate Limiting — 슬라이딩 윈도우 (초당 최대 3개)
const RATE_LIMIT = { maxMsg: 3, ttlSec: 2 };

const chkMsgLimitSec = async (userId) => {
  try {
    const key = `limitSec:${userId}:${Math.floor(Date.now() / 1000)}`;
    const count = await redis_client.incr(key);
    if (count === 1) await redis_client.expire(key, RATE_LIMIT.ttlSec);
    return { allowed: count <= RATE_LIMIT.maxMsg };
  } catch {
    // Redis 장애 시 rate limit 우회 허용 (graceful degradation)
    return { allowed: true };
  }
};

// XSS 방지
const escapeHTML = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c],
  );
};

/**
 * Redis 저장 + 스파이크 감지 (브로드캐스트 이후 비동기 실행)
 * 이 함수의 실패가 채팅 지연이나 에러로 이어지지 않도록 분리
 */
const persistMessage = async (hostId, safeMsg) => {
  try {
    const keys = getRedisKeys(hostId);
    const now = safeMsg.serverTimestamp;
    const TTL = 60 * 60 * 24;

    // 1. 메시지 히스토리 (재접속 복구용, 최근 50개 유지)
    await redis_client.rPush(keys.MSG, JSON.stringify(safeMsg));
    await redis_client.lTrim(keys.MSG, -50, -1);
    await redis_client.expire(keys.MSG, TTL);

    // 2. 채팅 참여자 Set (방송 종료 시 intoChatRate 계산용)
    await redis_client.sAdd(keys.CHAT_UNIQUE_USERS, safeMsg.id);
    await redis_client.expire(keys.CHAT_UNIQUE_USERS, TTL);

    // 3. 채팅 시계열 Sorted Set (스파이크 감지용)
    await redis_client.zAdd(keys.CHAT_TIMESERIES, {
      score: now,
      value: JSON.stringify({ userId: safeMsg.id, msgId: safeMsg.msgId }),
    });
    await redis_client.expire(keys.CHAT_TIMESERIES, TTL);

    // 4. 채팅 스파이크 감지
    await detectChatSpike(hostId);
  } catch (error) {
    // Redis 저장 실패해도 채팅은 이미 broadcast 완료 — 로그만 남김
    console.error("[Chat] Redis 저장 실패 (broadcast는 정상):", error.message);
  }
};

export const chatSocket = (socket, namespaceRoom) => {
  // 방 입장
  socket.on("join_room", async ({ hostId }) => {
    try {
      socket.join(hostId);

      // 재접속 메시지 복구 — Redis 실패해도 입장 자체는 정상 처리
      try {
        const keys = getRedisKeys(hostId);
        const recentMsg = await redis_client.lRange(keys.MSG, 0, 49);
        if (recentMsg.length > 0) {
          socket.emit("msg_history", {
            msgList: recentMsg.map((m) => JSON.parse(m)),
          });
        }
      } catch (redisError) {
        console.error("[Chat] 히스토리 복구 실패 (입장은 정상):", redisError.message);
      }

      console.log(`[Chat] ${hostId}방 입장`);
    } catch (error) {
      console.error("[Chat] 방 입장 오류:", error.message);
      socket.emit("error_event", { msg: "방 입장에 실패했습니다." });
    }
  });

  // 메시지 수신 + 처리
  socket.on("send_msg", async ({ msgInfo }) => {
    try {
      const { id: userId, hostId } = msgInfo;

      // 1. Rate Limiting
      const { allowed } = await chkMsgLimitSec(userId);
      if (!allowed) {
        socket.emit("msg_rejected", {
          reason: "rateLimit",
          msg: "메시지를 너무 빠르게 보내고 있습니다.",
        });
        return;
      }

      // 2. 메시지 정제 (XSS + 서버 타임스탬프 + 고유 ID)
      const safeMsg = {
        ...msgInfo,
        msg: escapeHTML(msgInfo.msg),
        userNickname: escapeHTML(msgInfo.userNickname),
        serverTimestamp: Date.now(),
        msgId: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };

      // 3. 즉시 브로드캐스트 — Redis 저장을 기다리지 않음
      namespaceRoom.to(hostId).emit("receive_msg", safeMsg);

      // 4. Redis 저장 + 스파이크 감지 — 비동기 (채팅 지연 없음)
      setImmediate(() => persistMessage(hostId, safeMsg));
    } catch (error) {
      console.error("[Chat] 메시지 처리 오류:", error.message);
      socket.emit("error_event", { msg: "메시지 전송 중 오류가 발생했습니다." });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[Chat] 유저 퇴장 (사유: ${reason})`);
  });
};
