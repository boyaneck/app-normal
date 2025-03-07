import React, { useEffect } from "react";

const PaymentPage = () => {
  useEffect(() => {
    const iamport = document.createElement("script");
    iamport.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.1.js";
    iamport.onload = () => {
      console.log("아임포트 로딩 완료");
    };
    iamport.onerror = () => {
      console.error("아임포트 로딩 실패");
    };
    document.head.appendChild(iamport);

    return () => {
      // Cleanup 스크립트 제거
      document.head.removeChild(iamport);
    };
  }, []);

  return <div></div>;
};

export default PaymentPage;
