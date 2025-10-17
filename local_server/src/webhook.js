import axios from "axios";
import { Buffer } from "buffer"; // Buffer 클래스 명시적 임포
import { redis_client } from "./config/redis.js";
import { stringify } from "querystring";
export const handleWebhook = async (req, res) => {
  try {
    const MAX_PAY = 1000000;

    const tx_id = req.body.tx_id; //
    const payment_id = req.body.payment_id; //
    const port_oneV2_secret_key = process.env.PORT_ONE_SECRET_KEY;

    const getPayment = await axios({
      url: `https://api.portone.io/payments?paymentId=${payment_id}`,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `PortOne ${port_oneV2_secret_key}`,
      },
    });
    const payment_data = getPayment.data.payments
      ? getPayment.data.payments[0]
      : getPayment.data;
    console.log("데이터확인", getPayment.data.items[0].amount.paid);
    console.log(
      "호스트 아이디",
      JSON.parse(JSON.parse(getPayment.data.items[0].customData))
    );
    const get_parsed_custom_data = JSON.parse(
      JSON.parse(getPayment.data.items[0].customData)
    );

    const room_name = get_parsed_custom_data.host_id;
    const donation_user = get_parsed_custom_data.user;
    const donation_sum = getPayment.data.items[0].amount.paid;
    console.log(
      "room_name",
      room_name,
      "donation_user",
      donation_user,
      "donation_sum",
      donation_sum
    );
    console.log(
      "room_name type of ",
      typeof room_name,
      "donation_user type of ",
      typeof donation_user,
      "donation_sum type of ",
      typeof donation_sum
    );
    // const donation_record={
    //   name:,
    //   paid:
    // }
    const donation_info_for_record = {
      user: donation_user,
      amount: donation_sum,
    };
    await redis_client.incrBy(`${room_name}:donation_sum`, donation_sum);
    await redis_client.lPush(
      `${room_name}:donation_list`,
      stringify(donation_info_for_record)
    );
    return res.status(200).json({
      status: "success",
      message: "결제 정보 조회 및 검증 완료",
    });
  } catch (e) {
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
