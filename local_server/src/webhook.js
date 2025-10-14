import axios from "axios";
import { Buffer } from "buffer"; // Buffer 클래스 명시적 임포트

export const handleWebhook = async (req, res) => {
  try {
    const MAX_PAY = 1000000;

    console.log("바디파싱", req.body);

    const tx_id = req.body.tx_id; //
    const orderId = req.body.payment_id; //
    const status = req.body.status;
    console.log("ㅇㅇㅇㅇ", tx_id);
    // 환경 변수 검증
    const toss_secret_key = process.env.TOSS_SECRET;
    const port_oneV2_store_id = process.env.PORT_ONE_STORE_KEY;
    const port_oneV2_secret_key = process.env.PORT_ONE_SECRET_KEY;

    if (!port_oneV2_secret_key || !port_oneV2_store_id) {
      console.error("Webhook, 포트원 REST API 키가 누락되었습니다.");
      // 웹훅 재전송을 막기 위해 200 OK 응답을 보냅니다.
      return res.status(200).json({ message: "내부 서버 오류: 키 누락" });
    }

    //정보조회

    // 환경

    // 정보조회 요청 수정
    const getPayment = await axios({
      // V2 API 주소 및 엔드포인트는 그대로 유지 (404가 아닌 401이 떴으므로 URL 자체는 존재한다고 가정)
      url: `https://api.portone.io/payments?merchantUid=${orderId}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        // 🚨 V2 공식 규격에 맞춰 Authorization 헤더 수정
        Authorization: `PortOne ${port_oneV2_secret_key}`,
        // "Portone-Store-Id"와 "Portone-Secret" 헤더는 삭제
      },
    });
    console.log("뀨우우우우우우우ㅜ우우우", getPayment);
    const payment_data = getPayment.data.payments
      ? getPayment.data.payments[0]
      : getPayment.data;
    const actual_amount = payment_data.amount;
    const payment_status = payment_data.status;
    console.log("==========================================");
    console.log(`[검증 결과] Merchant UID: ${orderId}`);
    console.log(`[검증 결과] 결제 금액: ${actual_amount} 원`);
    console.log(`[검증 결과] 결제 상태: ${payment_status}`);
    console.log("==========================================");

    return res.status(200).json({
      status: "success",
      message: "결제 정보 조회 및 검증 완료",
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
