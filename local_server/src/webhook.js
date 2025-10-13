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
    const port_one_secret_key = process.env.PORT_ONE_SECRET_KEY;
    const port_one_api_key = process.env.PORT_ONE_API_KEY;

    if (!port_one_secret_key || !port_one_api_key) {
      console.error("Webhook, 포트원 REST API 키가 누락되었습니다.");
      // 웹훅 재전송을 막기 위해 200 OK 응답을 보냅니다.
      return res.status(200).json({ message: "내부 서버 오류: 키 누락" });
    }
    // if (!toss_secret_key) {
    //   console.error("Webhook, TOSS_SECRET 키가 없습니다.");
    //   return res.status(500).json({ message: "내부서버 오류: 시크릿 키 누락" });
    // }

    // const parse_secret = Buffer.from(`${port_one_secret_key}:`).toString(
    //   `base64`
    // );
    // console.log("파싱하기", parse_secret);
    // // 2. 토스 API 호출 (URL에 tx_id 사용)
    // const getTossPayment = await axios({
    //   // url: `https://api.tosspayments.com/v1/payments/${toss_payment_key}`,
    //   url: `https://api.iamport.kr/payments/${imp_uid}`,
    //   method: "get",
    //   headers: {
    //     Authorization: `Basic ${parse_secret}`, // Basic 뒤 공백 정상
    //     "Content-Type": "application/json",
    //   },
    // });

    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: { imp_key: port_one_api_key, imp_secret: port_one_secret_key },
    });

    const { access_token } = getToken.data.response;

    console.log("----------------------------------", access_token);

    //정보조회

    const getPayment = await axios({
      url: `https://api.iamport.kr/payments/merchant_uid/${orderId}`,
      // url: `https://api.iamport.kr/payments/merchant_uid/${orderId}`,
      method: "get",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const payment_data = getPayment.data.response;
    console.log("최종으로 받아올 결제정보", payment_data);
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
