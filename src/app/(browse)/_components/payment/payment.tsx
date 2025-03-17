// "use client";
// import React, { useEffect, useState } from "react";
// import Modal from "@/components/ui/modal";
// const PaymentPage = () => {
//   const [is_modal_open, set_is_modal_open] = useState(false);

//   const openModal = () => {
//     set_is_modal_open(true);
//   };
//   const closeModal = () => {
//     set_is_modal_open(false);
//   };

//   const pay = () => {
//     const iamport = document.createElement("script");
//     iamport.src = "https://cdn.iamport.kr/v1/iamport.js";

//     iamport.onload = () => {
//       alert("zzzzzzzz");

//       // const { IMP } = (window as Window) as any;
//       const { IMP } = window as Window as any;
//       if (IMP) {
//         IMP.init(process.env.NEXT_PUBLIC_IAM_PORT_PG_CODE);

//         IMP.request_pay(
//           {
//             pg: "tosspayments",
//             pay_method: "card",
//             merchant_uid: `payment-${crypto.randomUUID()}`,
//             name: "노르웨이 회전 의자",
//             amount: 10,
//             buyer_email: "jinxx93@naver.com",
//             buyer_name: "홍길동",
//             buyer_tel: "010-4242-4242",
//             buyer_addr: "서울특별시 강남구 신사동",
//             buyer_postcode: "01181",
//           },
//           function (response: any) {
//             if (response.success) {
//               console.log("결제 성공:", response);
//             } else {
//               console.error("결제 실패:", response);
//             }
//           }
//         );
//       } else {
//         console.error("IMP 객체를 가져오는데 실패했습니다.");
//       }
//     };

//     iamport.onerror = () => {
//       console.error("아임포트 로딩 실패");
//     };

//     document.head.appendChild(iamport);
//   };

//   return (
//     <div>
//       <button onClick={pay}>결제</button>
//       <button
//         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         onClick={openModal}
//       >
//         Open Modal
//       </button>

//       <Modal isOpen={is_modal_open} onClose={closeModal} title="알림">
//         <p>This is the modal content.</p>
//         <button
//           className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//           onClick={closeModal}
//         >
//           Close
//         </button>
//       </Modal>
//     </div>
//   );
// };

// export default PaymentPage;
"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/modal"; // 기존 Modal 컴포넌트
import { motion } from "framer-motion";
import { createPortal } from "react-dom"; // React 18에서 ReactDOM 대신 import
import useUserStore from "@/store/user";

interface Props {
  current_host_nickname: string | null;
}
const PaymentPage = ({ current_host_nickname }: Props) => {
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
          amount: pay_ref?.current?.value,
          buyer_email: "jinxx93@naver.com",
          buyer_name: user?.user_nickname,
          buyer_tel: "010-4242-4242",
          // buyer_addr: "서울특별시 강남구 신사동",
          // buyer_postcode: "01181",
        },
        function (response: any) {
          if (response.success) {
            console.log("결제 성공:", response);
          } else {
            console.error("결제 실패:", response);
          }
        }
      );
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
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={openModal}
      >
        결제 창 열기
      </button>

      {is_modal_open && (
        <PaymentConfirmationModal isOpen={is_modal_open} onClose={closeModal} /> // 자체 모달 사용
      )}
    </div>
  );
};

export default PaymentPage;
