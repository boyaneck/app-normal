"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/modal"; // 기존 Modal 컴포넌트
import { motion } from "framer-motion";
import { createPortal } from "react-dom"; // React 18에서 ReactDOM 대신 import
import useUserStore from "@/store/user";

interface Props {
  current_host_nickname: string | null;
  current_host_id: string | null;
}
const PaymentPage = ({ current_host_nickname, current_host_id }: Props) => {
  const { user } = useUserStore();
  const pay_ref = useRef<HTMLInputElement>(null);
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [is_import_loaded, set_is_import_loaded] = useState(false);
  const [showPayment, setShowPayment] = useState(false); // 결제 진행 여부 상태 추가
  const [payment, set_payment] = useState<number>(0);
  useEffect(() => {
    const iamport = document.createElement("script");
    iamport.src = "https://cdn.iamport.kr/v1/iamport.js";

    iamport.onload = () => {
      set_is_import_loaded(true);
    };

    iamport.onerror = () => {
      console.error("아임포트 로딩 실패");
    };

    document.head.appendChild(iamport);

    return () => {
      document.head.removeChild(iamport);
    };
  }, []);

  const openModal = () => {
    set_is_modal_open(true);
  };

  const closeModal = () => {
    set_is_modal_open(false);
  };

  const pay = () => {
    if (!is_import_loaded) {
      alert("아임포트 스크립트 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    console.log("가격은 ?", pay_ref?.current?.value);
    const { IMP } = window as Window as any;
    if (IMP) {
      IMP.init(process.env.NEXT_PUBLIC_IAM_PORT_PG_CODE);

      IMP.request_pay(
        {
          pg: "tosspayments",
          pay_method: "card",
          merchant_uid: `payment-${crypto.randomUUID()}`,
          name: current_host_nickname + "에게 후원",

          custom_data: JSON.stringify({
            host_id: "!!!!호스트의 아이디가 들어갈수잇도록 할것",
            user: user?.user_nickname,
          }),
          // amount: pay_ref?.current?.value,
          amount: 103,
          buyer_email: "jinxx93@naver.com",
          buyer_name: user?.user_nickname,
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
      console.log("결제 데이터가 잘 가는ㄴ지 확인하기", IMP.request_pay);
      closeModal(); // 결제창 닫기
    } else {
      console.error("IMP 객체를 가져오는데 실패했습니다.");
    }
  };

  // 자체 모달 컴포넌트 (framer-motion 적용)
  const PaymentConfirmationModal = ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const modalVariants = {
      hidden: { scale: 0 },
      visible: {
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.2,
        },
      },
      exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
    };

    return createPortal(
      <div
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-4/5 max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <p>결제를 진행하시겠습니까?</p>
          <div>결제창 만들기</div>
          <div>{current_host_nickname} 유저에게 입금됩니다.</div>
          <input placeholder="금액을 입력하세요" ref={pay_ref}></input>

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={pay} // 결제 진행 함수 호출
          >
            결제 진행
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={onClose}
          >
            취소
          </button>
        </motion.div>
      </div>,
      document.body
    );
  };

  return (
    <div>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold rounded"
        onClick={openModal}
      >
        <span className="hover:animate-money-flap">💰</span>
      </button>

      {is_modal_open && (
        <PaymentConfirmationModal isOpen={is_modal_open} onClose={closeModal} /> // 자체 모달 사용
      )}
    </div>
  );
};

export default PaymentPage;
