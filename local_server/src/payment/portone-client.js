import axios from "axios";

const PORTONE_API_URL = "https://api.portone.io";

// paymentId로 결제 정보 조회 (PortOne V2)
export const getPaymentInfo = async (paymentId) => {
  const { data } = await axios.get(
    `${PORTONE_API_URL}/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `PortOne ${process.env.PORTONE_SECRET_KEY}`,
      },
    },
  );
  return data;
};
