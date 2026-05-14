import { redis_client } from "../config/redis.js";
import { getRedisKeys } from "../live/redis-keys.js";
import { getPaymentInfo } from "./portone-client.js";
import { detectDonationSpike } from "./donation-spike-detector.js";

// 결제 검증 (포트원 서버 재조회 + 금액 대조)
export const verifyPayment = async (impUid, expectedAmount) => {
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

// 멱등성 체크 — 같은 imp_uid 중복 처리 방지
export const chkIdempotency = async (impUid) => {
  const isNew = await redis_client.setNX(`payment:processed:${impUid}`, "1");
  if (isNew) await redis_client.expire(`payment:processed:${impUid}`, 60 * 60 * 24);
  return isNew;
};

// 후원 데이터 Redis 저장 + 스파이크 감지 트리거
export const saveDonation = async (hostId, paymentInfo) => {
  const keys = getRedisKeys(hostId);
  const now = Date.now();

  const donationInfo = {
    impUid: paymentInfo.impUid,
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
  await redis_client.sAdd(keys.DONATION_UNIQUE_USERS, paymentInfo.buyerName ?? "anonymous");

  // 스파이크 감지용 시계열 (score = timestamp, value = JSON)
  await redis_client.zAdd(keys.DONATION_TIMESERIES, {
    score: now,
    value: JSON.stringify({ amount: paymentInfo.amount, impUid: paymentInfo.impUid }),
  });

  // TTL 설정 (24시간)
  const TTL = 60 * 60 * 24;
  await redis_client.expire(keys.DONATION, TTL);
  await redis_client.expire(keys.DONATION_TOTAL_AMOUNT, TTL);
  await redis_client.expire(keys.DONATION_COUNT, TTL);
  await redis_client.expire(keys.DONATION_TIMESERIES, TTL);
  await redis_client.expire(keys.DONATION_UNIQUE_USERS, TTL);

  // 스파이크 감지
  await detectDonationSpike(hostId, paymentInfo.amount);

  return donationInfo;
};

// 결제 처리 메인 오케스트레이터
export const processPayment = async ({ impUid, amount, hostId }) => {
  // 1. 중복 처리 방지
  const isNew = await chkIdempotency(impUid);
  if (!isNew) {
    return { success: true, msg: "이미 결제된 후원입니다.", duplicate: true };
  }

  // 2. 결제 검증
  const verification = await verifyPayment(impUid, amount);
  if (!verification.verified) {
    // 검증 실패 시 멱등성 키 제거 (재시도 허용)
    await redis_client.del(`payment:processed:${impUid}`);
    return {
      success: false,
      msg: verification.msg,
      reason: verification.reason,
    };
  }

  // 3. 저장 + 스파이크 감지
  const donationData = await saveDonation(hostId, verification.paymentInfo);

  return {
    success: true,
    msg: "결제가 정상 처리되었습니다.",
    donation: donationData,
  };
};
