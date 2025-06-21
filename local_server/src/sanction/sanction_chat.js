const sanction_duration = {
  "30m": 30,
  "1h": 60,
  "24h": 60 * 60 * 24,
  permanent: -1,
};

const sanctionChat = async (req, res) => {
  console.log("제재 관련 정보를 보냄", req.body.sanction_info);
  console.log("제재 관련 req body", req.body);

  const { user_id, streamer_id, duration, reason } = req.body;
  try {
    if (!streamer_id || !user_id || !reason || !duration) {
      return res.status(400).json({ message: "필수정보가 누락되었습니다." });
    }

    const key = `sanction${streamer_id}:${user_id}`;
    const value = `${reason}:${duration}`;

    if (duration === -1) {
      await redis_client.set(key);
      console.log(
        `스트리머${streamer_id}방송의 유저${user_id}를 영구 금지합니다`
      );
    } else if (duration > 0) {
      await redis_client.set(key, "EX", duration);
    }
    const redis_key = JSON.stringify({
      reason,
      duration,
      start_at: new Date().toISOString(),
    });
  } catch (error) {}
};

module.exports = sanctionChat;
