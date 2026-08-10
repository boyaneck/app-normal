import crypto from "crypto";
import { getPaymentInfo } from "./portone-client.js";
import { processPayment } from "./payment-service.js";

// PortOne V2 웹훅 서명 검증 (Svix 표준: webhook-id / webhook-timestamp / webhook-signature)
// req.body는 express.raw()로 받은 Buffer여야 서명 대상 원문과 정확히 일치한다.
const verifyWebhookSignature = (req) => {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  const webhookId = req.headers["webhook-id"];
  const webhookTimestamp = req.headers["webhook-timestamp"];
  const signatureHeader = req.headers["webhook-signature"];

  if (!secret || !webhookId || !webhookTimestamp || !signatureHeader)
    return false;

  // 재전송 공격 방지 (5분 이내 타임스탬프만 허용)
  const tsSeconds = Number(webhookTimestamp);
  if (
    !Number.isFinite(tsSeconds) ||
    Math.abs(Date.now() / 1000 - tsSeconds) > 5 * 60
  ) {
    return false;
  }

  const secretBytes = Buffer.from(secret.split("_").pop(), "base64");
  const signedContent = `${webhookId}.${webhookTimestamp}.${req.body.toString("utf-8")}`;
  const expectedSig = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  // webhook-signature 헤더는 "v1,<base64sig> v1,<base64sig2> ..." 형태(키 롤오버 대비 복수 개일 수 있음)
  return signatureHeader
    .split(" ")
    .map((entry) => entry.split(",")[1])
    .filter(Boolean)
    .some((sig) => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(sig, "base64"),
          Buffer.from(expectedSig, "base64"),
        );
      } catch {
        return false;
      }
    });
};

// PortOne → 서버 웹훅 핸들러 (Transaction.Paid 등)
export const paymentWebhook = async (req, res) => {
  // console.log("웹훅 이벤트 옴 ", req);
  console.log("웹훅 이벤트 도착");
  if (!verifyWebhookSignature(req)) {
    console.error("[Webhook] 서명 검증 실패");
    return res.status(401).json({ success: false, msg: "Unauthorized" });
  }

  // 즉시 200 응답 (포트원 재전송 방지)
  res.status(200).json({ success: true, msg: "webhook 수신 완료" });
  console.log("verifywebhook은 통과");
  // 비동기 결제 처리 (응답 이후)
  try {
    const body = JSON.parse(req.body.toString("utf-8"));

    if (body.type && body.type !== "Transaction.Paid") {
      console.log(`[Webhook] ${body.type} 이벤트 — 처리 스킵`);
      return;
    }

    const paymentAmount = body.data?.pureAmount;
    const paymentId = body.data?.paymentId;
    console.log(
      "웹훅으로 부터 받은 결제한 유저의  id",
      paymentId,
      "결제 금액",
      paymentAmount,
    );
    if (!paymentId) return;
    const paymentInfo = await getPaymentInfo(paymentId);
    const result = await processPayment({
      paymentId,
      amount: paymentInfo.amount?.total,
    });
    console.log("[Webhook] 결제 처리 완료:", result);
  } catch (error) {
    console.error("[Webhook] 비동기 처리 에러:", error.message);
  }
};

// 클라이언트 → 서버 결제 검증 핸들러 (결제창 성공 콜백 이후 프론트에서 호출)
export const handleVerify = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({
        success: false,
        msg: "필수 값 누락 (paymentId, amount)",
      });
    }

    const result = await processPayment({ paymentId, amount: Number(amount) });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("[handleVerify] 에러:", error.message);
    res.status(500).json({ success: false, msg: "결제 검증 중 오류 발생" });
  }
};
