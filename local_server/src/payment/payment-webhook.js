import crypto from "crypto";
import { getPaymentInfo } from "./portone-client.js";
import { processPayment } from "./payment-service.js";

// PortOne 웹훅 HMAC 서명 검증
const verifyWebhookSignature = (body, signature) => {
  if (!signature) return false;
  const secret = process.env.IMP_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  // timingSafeEqual: 타이밍 어택 방지
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
};

// PortOne → 서버 웹훅 핸들러
export const paymentWebhook = async (req, res) => {
  // 1. HMAC 서명 검증
  const signature = req.headers["x-iamport-signature"];
  if (!verifyWebhookSignature(req.body, signature)) {
    console.error("[Webhook] 서명 검증 실패");
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  // 2. 즉시 200 응답 (포트원 재전송 방지)
  res.status(200).json({ success: true, msg: "webhook 수신 완료" });

  // 3. 비동기 결제 처리 (응답 이후)
  try {
    const { imp_uid, status } = req.body;
    if (!imp_uid) return;

    if (status !== "paid") {
      console.log(`[Webhook] ${status} 상태 — 처리 스킵`);
      return;
    }

    const paymentInfo = await getPaymentInfo(imp_uid);

    let hostId = null;
    try {
      const customData = JSON.parse(paymentInfo.custom_data || "{}");
      hostId = customData.host_id;
    } catch (e) {}

    if (!hostId) {
      console.error("[Webhook] hostId를 찾을 수 없습니다");
      return;
    }

    const result = await processPayment({
      impUid: imp_uid,
      amount: paymentInfo.amount,
      hostId,
    });

    console.log("[Webhook] 결제 처리 완료:", result);
  } catch (error) {
    console.error("[Webhook] 비동기 처리 에러:", error.message);
  }
};

// 클라이언트 → 서버 결제 검증 핸들러
export const handleVerify = async (req, res) => {
  try {
    const { impUid, amount, hostId } = req.body;

    if (!impUid || !amount || !hostId) {
      return res.status(400).json({
        success: false,
        msg: "필수 값 누락 (impUid, amount, hostId)",
      });
    }

    const result = await processPayment({
      impUid,
      amount: Number(amount),
      hostId,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("[handleVerify] 에러:", error.message);
    res.status(500).json({ success: false, msg: "결제 검증 중 오류 발생" });
  }
};
