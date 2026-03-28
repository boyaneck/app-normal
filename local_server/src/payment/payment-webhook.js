let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const res = await fetch(`${IAMPORT_API_URL}/users/getToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key: IAMPORT_API_KEY,
      imp_secret: IAMPORT_API_SECRET,
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`토큰 발급 실패: ${data.message}`);

  cachedToken = data.response.access_token;
  tokenExpiresAt = data.response.expired_at * 1000;
  return cachedToken;
};
const verifyPayment = async (impUid, expectedAmount) => {
  const paymentInfo = await getPaymentInfo(impUid);

  if (paymentInfo.status !== "paid") {
    return {
      verified: false,
      reason: "notPaid",
      msg: `결제 상태: ${paymentInfo.status}`,
    };
  }

  if (paymentInfo.amount !== expectedAmount) {
    return {
      verified: false,
      reason: "amountMismatch",
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
export const paymentWebhook = async () => {};
