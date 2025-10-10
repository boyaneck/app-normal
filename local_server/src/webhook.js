import axios from "axios";
import { Buffer } from "buffer"; // Buffer 클래스 명시적 임포트

export const handleWebhook = async (req, res) => {
  try {
    const MAX_PAY = 1000000;

    console.log("바디파싱", req.body);

    const tossPaymentKey = req.body.tx_id; //
    const orderId = req.body.payment_id; //
    const status = req.body.status;

    // 환경 변수 검증
    const toss_secret_key = process.env.TOSS_SECRET;
    if (!toss_secret_key) {
      console.error("Webhook, TOSS_SECRET 키가 없습니다.");
      return res.status(500).json({ message: "내부서버 오류: 시크릿 키 누락" });
    }

    const parse_secret = Buffer.from(`${toss_secret_key}:`).toString(`base64`);

    // 2. 토스 API 호출 (URL에 tossPaymentKey 사용)
    const getTossPayment = await axios({
      url: `https://api.tosspayments.com/v2/payments/${tossPaymentKey}`,
      method: "get",
      headers: {
        Authorization: `Basic ${parse_secret}`, // Basic 뒤 공백 정상
        "Content-Type": "application/json",
      },
    });
    console.log("----------------------------------");

    const payment_data = getTossPayment.data;
    console.log("토스페이먼트 결제 정보", payment_data);

    return res.status(200).json({
      status: "verification_started",
      message: "결제 정보 조회 완료. 후속 검증 필요.",
    });
  } catch (e) {
    // 🚨 API 오류 상세 로그 출력
    console.error(
      "웹훅 오류 발생. 상세:",
      e.response ? e.response.data : e.message
    );
    console.log("에러확인", e);

    // 4. 오류가 발생해도 재발송 방지를 위해 200 OK 응답
    return res.status(200).json({
      status: "verification_failed_but_received",
      message: "웹훅 처리 중 오류 발생. 로그 확인 필요.",
    });
  }
};
