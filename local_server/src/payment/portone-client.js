import axios from "axios";

const IAMPORT_API_URL = "https://api.iamport.kr";

let cachedToken = null;
let tokenExpiresAt = 0;

// 액세스 토큰 (만료 1분 전 자동 갱신)
export const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const { data } = await axios.post(`${IAMPORT_API_URL}/users/getToken`, {
    imp_key: process.env.IAMPORT_API_KEY,
    imp_secret: process.env.IAMPORT_API_SECRET,
  });

  if (data.code !== 0) throw new Error(`토큰 발급 실패: ${data.message}`);

  cachedToken = data.response.access_token;
  tokenExpiresAt = data.response.expired_at * 1000;
  return cachedToken;
};

// imp_uid로 결제 정보 조회
export const getPaymentInfo = async (impUid) => {
  const token = await getAccessToken();
  const { data } = await axios.get(`${IAMPORT_API_URL}/payments/${impUid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (data.code !== 0) throw new Error("결제 조회 실패");
  return data.response;
};
