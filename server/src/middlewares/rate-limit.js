import { redis_client } from "../config/redis.js";

/**
 * 사용자별 요청 횟수 제한 (고정 윈도우)
 * AI 라우트처럼 호출할 때마다 비용이 드는 곳에 붙인다.
 * requireUser 뒤에 와야 한다 (req.user.id 사용).
 *
 * @param {string} name  제한 이름 (키 구분용)
 * @param {number} max   윈도우당 최대 요청 수
 * @param {number} windowSec 윈도우 길이(초)
 */
export const rateLimit =
  ({ name, max, windowSec }) =>
  async (req, res, next) => {
    try {
      const userId = req.user?.id ?? req.ip;
      const windowId = Math.floor(Date.now() / (windowSec * 1000));
      const key = `ratelimit:${name}:${userId}:${windowId}`;

      const count = await redis_client.incr(key);
      if (count === 1) await redis_client.expire(key, windowSec);

      if (count > max) {
        return res
          .status(429)
          .json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
      }
      next();
    } catch {
      // Redis 장애 시에는 서비스가 멈추지 않도록 통과시킨다 (graceful degradation)
      next();
    }
  };
