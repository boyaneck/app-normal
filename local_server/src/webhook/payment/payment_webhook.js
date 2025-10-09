const paymentWebhook = async (req, res) => {
  try {
    console.log("✅ 웹훅 요청 받음!");
    const { imp_uid, merchant_uid } = req.body;
    // 웹훅 시그니처 검증
    const signature = req.headers["x-iamport-signature"];

    console.log("까룩끼룩", req.headers["content-length"]);
    // console.log("헤더", req.headers);
    console.log("바디", req.body);
    const impSecret = process.env.IMP_SECRET;

    if (!impSecret) {
      console.error("[Webhook] Missing IMP_SECRET");
      return res
        .status(500)
        .json({ message: "Internal server error: Missing IMP_SECRET" });
    }

    const message = JSON.stringify(req.body);
    const hmac = crypto.createHmac("sha256", impSecret);
    hmac.update(message);
    const expectedSignature = hmac.digest("hex");

    console.log("확인좀..", signature, "????", expectedSignature);
    if (signature !== expectedSignature) {
      console.error("[Webhook] Signature verification failed");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 액세스 토큰(access token) 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: {
        imp_key: process.env.IMP_KEY, // REST API키
        imp_secret: process.env.IMP_SECRET, // REST API Secret
      },
    });

    const { access_token } = getToken.data.response;

    // imp_uid로 포트원 서버에서 결제 정보 조회
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`,
      method: "get",
      headers: { Authorization: access_token },
    });

    const paymentData = getPaymentData.data.response; // 조회한 결제 정보

    // 결제 금액과 주문 금액 비교 (위변조 검증)
    const amountToBePaid = 1000; // 예시: DB 연동 전 임시값

    // 결제 검증하기
    const { amount, status } = paymentData;

    // 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
    if (amount === amountToBePaid) {
      // DB에 결제 정보 저장 (가정)
      // await Orders.findByIdAndUpdate(merchant_uid, { $set: paymentData });

      switch (status) {
        case "ready": // 가상계좌 발급
          // DB에 가상계좌 발급 정보 저장 (가정)
          const { vbank_num, vbank_date, vbank_name } = paymentData;
          // await Users.findByIdAndUpdate("/* 고객 id */", { // TODO: 고객 ID
          //   $set: { vbank_num, vbank_date, vbank_name },
          // });

          // 가상계좌 발급 안내 문자메시지 발송 (가정)
          // SMS.send({
          //   text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`,
          // });

          res.json({ status: "vbankIssued", message: "가상계좌 발급 성공" });
          break;

        case "paid": // 결제 완료
          res.json({ status: "success", message: "일반 결제 성공" });
          break;
      }
    } else {
      // 결제금액 불일치. 위/변조 된 결제
      console.error(
        `[Webhook] Amount forgery detected: imp_uid=${imp_uid}, merchant_uid=${merchant_uid}, amount=${amount}, amountToBePaid=${amountToBePaid}`
      );
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    console.error("[Webhook] Error:", e);
    res.status(400).json(e); // 수정: JSON 형식으로 오류 응답
  }

  return;
};
