const sanction_duration = {
  "30m": 30,
  "1h": 60,
  "24h": 60 * 24,
  permanent: null,
};

const sanctionChat = async (req, res) => {
  console.log("제재 관련 정보를 보냄");

  try {
    const {} = req.body;
  } catch (error) {}
};

module.exports = sanctionChat;
