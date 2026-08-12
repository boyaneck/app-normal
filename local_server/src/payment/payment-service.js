import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";
import { getSupabase } from "../config/supabase.js";
import { getPaymentInfo } from "./portone-client.js";
import { detectDonationSpike } from "./donation-spike-detector.js";

// 결제 검증 (PortOne V2 서버 재조회 + 금액 대조 + custom_data에서 host_id 추출)
// expectedAmount가 없으면(웹훅 경로 — 대조할 클라이언트 입력이 없음) 금액 비교를 생략하고 조회된 금액을 그대로 신뢰한다
export const verifyPayment = async (paymentId, expectedAmount) => {
  const paymentInfo = await getPaymentInfo(paymentId);

  if (paymentInfo.status !== "PAID") {
    return {
      verified: false,
      reason: "결제 안됨",
      msg: `결제 상태: ${paymentInfo.status}`,
    };
  }

  const paidAmount = paymentInfo.amount?.total;
  if (expectedAmount != null && paidAmount !== expectedAmount) {
    return {
      verified: false,
      reason: "결제 금액 불일치",
      msg: `요청(${expectedAmount}) != 실제(${paidAmount})`,
    };
  }

  // host_id는 클라이언트가 아닌 포트원에 저장된 custom_data에서 서버가 직접 추출한다 (위변조 방지)
  let hostId = null;
  try {
    hostId = JSON.parse(paymentInfo.customData || "{}").host_id ?? null;
  } catch {}

  if (!hostId) {
    return {
      verified: false,
      reason: "hostId 누락",
      msg: "결제 데이터에서 host_id를 찾을 수 없습니다.",
    };
  }

  return {
    verified: true,
    hostId,
    paymentInfo: {
      paymentId: paymentInfo.id,
      amount: paidAmount,
      buyerName: paymentInfo.customer?.name ?? null,
      paidAt: paymentInfo.paidAt,
      status: paymentInfo.status,
    },
  };
};

// 멱등성 체크 — 같은 paymentId 중복 처리 방지
export const chkIdempotency = async (paymentId) => {
  const isNew = await redis_client.setNX(`payment:processed:${paymentId}`, "1");
  if (isNew)
    await redis_client.expire(`payment:processed:${paymentId}`, 60 * 60 * 24);
  return isNew;
};

// 후원 데이터 저장 + 스파이크 감지 트리거
// Redis: 방송 중 실시간 통계/하이라이트용 캐시 (TTL 24h)
// Supabase payments 테이블: 후원왕/매출 통계 등 영구 조회용 소스
export const saveDonation = async (hostId, paymentInfo) => {
  const keys = getRedisKeys(hostId);
  const now = Date.now();

  const donationInfo = {
    paymentId: paymentInfo.paymentId,
    amount: paymentInfo.amount,
    buyerName: paymentInfo.buyerName,
    paidAt: paymentInfo.paidAt,
    timestamp: now,
  };

  // 목록 저장 (최근 100개 유지)
  await redis_client.rPush(keys.DONATION, JSON.stringify(donationInfo));
  await redis_client.lTrim(keys.DONATION, -100, -1);

  // 누적 통계
  await redis_client.incrBy(keys.DONATION_TOTAL_AMOUNT, paymentInfo.amount);
  await redis_client.incr(keys.DONATION_COUNT);

  // 고유 후원자 (buyerName 기준 중복 제거)
  await redis_client.sAdd(
    keys.DONATION_UNIQUE_USERS,
    paymentInfo.buyerName ?? "anonymous",
  );

  // 스파이크 감지용 시계열 (score = timestamp, value = JSON)
  await redis_client.zAdd(keys.DONATION_TIMESERIES, {
    score: now,
    value: JSON.stringify({
      amount: paymentInfo.amount,
      paymentId: paymentInfo.paymentId,
    }),
  });

  // TTL 설정 (24시간)
  const TTL = 60 * 60 * 24;
  await redis_client.expire(keys.DONATION, TTL);
  await redis_client.expire(keys.DONATION_TOTAL_AMOUNT, TTL);
  await redis_client.expire(keys.DONATION_COUNT, TTL);
  await redis_client.expire(keys.DONATION_TIMESERIES, TTL);
  await redis_client.expire(keys.DONATION_UNIQUE_USERS, TTL);

  // 영구 기록 (Redis는 TTL로 사라지므로 여기가 후원왕/매출 통계의 소스 오브 트루스)
  const { error } = await getSupabase()
    .from("payments")
    .insert({
      payment_id: paymentInfo.paymentId,
      host_id: hostId,
      user_nickname: paymentInfo.buyerName ?? "익명",
      amount: String(paymentInfo.amount),
      paid_at: paymentInfo.paidAt,
    });
  if (error) {
    console.error("[saveDonation] Supabase 저장 실패:", error.message);
  }

  // 스파이크 감지
  await detectDonationSpike(hostId, paymentInfo.amount);

  return donationInfo;
};

// 결제 처리 메인 오케스트레이터
export const processPayment = async ({ paymentId, amount }) => {
  // 1. 중복 처리 방지
  const isNew = await chkIdempotency(paymentId);
  if (!isNew) {
    return { success: true, msg: "이미 결제된 후원입니다.", duplicate: true };
  }

  // 2. 결제 검증 (호스트 ID는 포트원 custom_data에서 서버가 직접 추출)
  const verification = await verifyPayment(paymentId, amount);
  if (!verification.verified) {
    // 검증 실패 시 멱등성 키 제거 (재시도 허용)
    await redis_client.del(`payment:processed:${paymentId}`);
    return {
      success: false,
      msg: verification.msg,
      reason: verification.reason,
    };
  }

  // 3. 저장 + 스파이크 감지
  const donationData = await saveDonation(
    verification.hostId,
    verification.paymentInfo,
  );

  return {
    success: true,
    msg: "결제가 정상 처리되었습니다.",
    donation: donationData,
  };
};
