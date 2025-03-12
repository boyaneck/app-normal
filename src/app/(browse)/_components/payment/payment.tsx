"use client";
import React, { useEffect } from "react";

const PaymentPage = () => {
  const pay = () => {
    const iamport = document.createElement("script");
    iamport.src = "https://cdn.iamport.kr/v1/iamport.js";

    iamport.onload = () => {
      console.log("아임포트 로딩 완료");
      // const { IMP } = (window as Window) as any;
      const { IMP } = window as Window as any;
      if (IMP) {
        IMP.init(process.env.NEXT_PUBLIC_IAM_PORT_PG_CODE);

        IMP.request_pay(
          {
            channelKey: "channel-key-01d6477b-f96a-43d4-88e5-62eedd636a0c",
            pay_method: "card",
            merchant_uid: `payment-${crypto.randomUUID()}`,
            name: "노르웨이 회전 의자",
            amount: 10,
            buyer_email: "jinxx93@naver.com",
            buyer_name: "홍길동",
            buyer_tel: "010-4242-4242",
            buyer_addr: "서울특별시 강남구 신사동",
            buyer_postcode: "01181",
          },
          function (response: any) {
            if (response.success) {
              console.log("결제 성공:", response);
            } else {
              console.error("결제 실패:", response);
            }
          }
        );
      } else {
        console.error("IMP 객체를 가져오는데 실패했습니다.");
      }
    };

    iamport.onerror = () => {
      console.error("아임포트 로딩 실패");
    };

    document.head.appendChild(iamport);
  };

  return (
    <div>
      <button onClick={pay}>결제</button>
    </div>
  );
};

export default PaymentPage;
