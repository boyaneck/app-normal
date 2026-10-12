const sanctionController = async () => {
  const createSanction = async (req, res) => {
    const { user_id, duration, reason } = req.body;
    if (!user_id || !duration || !reason) {
      return res
        .status(400)
        .json({ message: "🚀필수 정보인 '유저아이디or기간or사유'가 연장됨" });
    }

    try {
      const result = await sanctionService(user_id, duration, reason);
      res.status(201).json();
    } catch (error) {
      const user_id = req.user_id;
      res.status(500).json({ message: "🚀" + error.message });
    }
  };
};
