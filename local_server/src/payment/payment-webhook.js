import axios from "axios";
import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/live-webhook.js";

const IAMPORT_API_URL = "https://api.iamport.kr";
const IAMPORT_API_KEY = process.env.IAMPORT_API_KEY;
const IAMPORT_API_SECRET = process.env.IAMPORT_API_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

// 아임포트로부터 토큰 받기
const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const { data } = await axios.post(`${IAMPORT_API_URL}/users/getToken`, {
    imp_key: IAMPORT_API_KEY,
    imp_secret: IAMPORT_API_SECRET,
  });
  if (data.code !== 0) throw new Error(`토큰 발급 실패: ${data.message}`);

  cachedToken = data.response.access_token;
  tokenExpiresAt = data.response.expired_at * 1000;
  return cachedToken;
};

// 결제 정보 조회
const getPaymentInfo = async (impUid) => {
  const token = await getAccessToken();
  const { data } = await axios.get(`${IAMPORT_API_URL}/payments/${impUid}`, {
    headers: { Authorization: `Bearer ${token}` }, // 수정: 객체 형태 + 공백
  });
  if (data.code !== 0) throw new Error("결제 조회 실패");

  return data.response;
};

// 결제 검증
const verifyPayment = async (impUid, expectedAmount) => {
  const paymentInfo = await getPaymentInfo(impUid);

  if (paymentInfo.status !== "paid") {
    return {
      verified: false,
      reason: "결제 안됨",
      msg: `결제 상태: ${paymentInfo.status}`,
    };
  }

  if (paymentInfo.amount !== expectedAmount) {
    return {
      verified: false,
      reason: "결제 금액 불일치",
      msg: `요청(${expectedAmount}) != 실제(${paymentInfo.amount})`,
    };
  }

  // 수정: iamport API 응답은 snake_case (imp_uid, merchant_uid 등)
  return {
    verified: true,
    paymentInfo: {
      impUid: paymentInfo.imp_uid,
      merchantUid: paymentInfo.merchant_uid,
      amount: paymentInfo.amount,
      buyerName: paymentInfo.buyer_name,
      paidAt: paymentInfo.paid_at,
      status: paymentInfo.status,
    },
  };
};

// 멱등성 체크
const chkIdempotency = async (impUid) => {
  const isNew = await redis_client.setNX(`payment:processed:${impUid}`, "1");
  if (isNew)
    await redis_client.expire(`payment:processed:${impUid}`, 60 * 60 * 24);
  return isNew;
};

// 후원 금액 Redis 저장
const saveDonation = async (hostId, paymentInfo) => {
  const redisKey = getRedisKeys(hostId);

  const donationInfo = {
    impUid: paymentInfo.impUid,
    amount: paymentInfo.amount,
    buyerName: paymentInfo.buyerName,
    paidAt: paymentInfo.paidAt,
    timestamp: Date.now(),
  };

  // 수정: donationData → donationInfo (변수명 통일)
  await redis_client.rPush(redisKey.DONATION, JSON.stringify(donationInfo));
  await redis_client.incrBy(redisKey.DONATION_TOTAL_AMOUNT, paymentInfo.amount);
  await redis_client.incr(redisKey.DONATION_COUNT);

  await redis_client.expire(redisKey.DONATION, 60 * 60 * 24);
  await redis_client.expire(redisKey.DONATION_TOTAL_AMOUNT, 60 * 60 * 24);
  await redis_client.expire(redisKey.DONATION_COUNT, 60 * 60 * 24);

  return donationInfo;
};

// 결제 처리 메인
// 수정: amount, hostId도 파라미터로 받아야 함
const processPayment = async ({ impUid, amount, hostId }) => {
  const isNew = await chkIdempotency(impUid);
  if (!isNew) {
    return { success: true, msg: "이미 결제된 후원입니다.", duplicate: true };
  }

  const verification = await verifyPayment(impUid, amount);
  if (!verification.verified) {
    await redis_client.del(`payment:processed:${impUid}`);
    return {
      success: false,
      msg: verification.msg,
      reason: verification.reason,
    };
  }

  const donationData = await saveDonation(hostId, verification.paymentInfo);
  return {
    success: true,
    msg: "결제가 정상 처리되었습니다.",
    donation: donationData,
  };
};

// webhook 핸들러
// 수정: 함수 닫는 중괄호 추가
export const paymentWebhook = async (req, res) => {
  try {
    const { imp_uid, merchant_uid, status } = req.body;
    if (!imp_uid) throw new Error("imp_uid가 없습니다");
    if (status !== "paid") {
      return res.status(200).json({ success: true, msg: `${status} 처리` });
    }

    const paymentInfo = await getPaymentInfo(imp_uid);

    let hostId = null;
    let buyerName = null;
    try {
      // 수정: iamport API 응답은 snake_case → custom_data
      const customData = JSON.parse(paymentInfo.custom_data || "{}");
      hostId = customData.host_id;
      buyerName = customData.user;
    } catch (e) {}

    if (!hostId) throw new Error("hostId를 찾을 수 없습니다");

    // 수정: merchantUid 오타, 그리고 구조분해한 merchant_uid 사용
    const paymentResult = await processPayment({
      impUid: imp_uid,
      amount: paymentInfo.amount,
      hostId,
    });

    console.log("결제 완료 상태 체크", paymentResult);
    res.status(200).json(paymentResult);
  } catch (error) {
    console.error("결제 Webhook 에러:", error.message);
    res.status(200).json({ success: false, msg: error.message });
  }
};

export const handleVerify = async (req, res) => {
  try {
    const { impUid, merchantUid, amount, hostId, buyerName } = req.body;

    if (!impUid || !amount || !hostId) {
      return res.status(400).json({
        success: false,
        msg: "필수 값이 누락되었습니다⚠️ . (impUid, amount, hostId)",
      });
    }

    const result = await processPayment({
      impUid,
      merchantUid,
      amount: Number(amount),
      hostId,
      buyerName,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("[결제 검증] 에러:⚠️ ", error.message);
    res
      .status(500)
      .json({ success: false, msg: "결제 검증 중 오류가 발생했습니다.⚠️ " });
  }
};
