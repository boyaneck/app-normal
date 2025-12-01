"use client";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "@/components/ui/modal"; // 기존 Modal 컴포넌트
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom"; // React 18에서 ReactDOM 대신 import
import useUserStore from "@/store/user";

const MAX_MONEY = 100000000;
const SELECT_PM_NUM = [5000, 10000, 50000];
interface Props {
  current_host_nickname: string | null;
  current_host_id: string | null;
  is_pm_modal_open: boolean;
  set_is_pm_modal_open: Dispatch<SetStateAction<boolean>>;
}
const PaymentPage = ({
  current_host_nickname,
  current_host_id,
  is_pm_modal_open,
  set_is_pm_modal_open,
}: Props) => {
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

  const pay = () => {
    if (!is_import_loaded) {
      alert("아임포트 스크립트 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

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
          amount: input_money,
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

  interface payment_input_props {
    is_open: boolean;
    is_close: () => void;
  }
  const [error, set_error] = useState<string>("");
  const [shake_key, set_shake_key] = useState<number>(0);
  const [input_money, set_input_money] = useState<string>("");
  const openModal = useCallback(() => {
    set_is_modal_open(true);
  }, []);

  // 모달 닫기
  const closeModal = useCallback(() => {
    set_is_modal_open(false);
    set_error("");
    set_input_money(""); // 금액 초기화
    set_shake_key(0); // 쉐이크 키 초기화
  }, []);
  const moneyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (Number(val) > MAX_MONEY) {
        if (Number(input_money) === MAX_MONEY) {
          set_shake_key((prev) => prev + 1);
          return;
        }
        set_error(`최대 결제 금액은 ${formatNum(MAX_MONEY)}원 입니다.`);
        val = String(MAX_MONEY);
        set_shake_key((prev) => prev + 1);
      } else {
        set_error("");
      }
      set_input_money(val);
    },
    [input_money]
  );
  const pmModalVarients = ({
    is_open,
    is_close,
  }: {
    is_open: boolean;
    is_close: () => void;
  }) => {};
  const modalVariants = {
    hidden: { y: "100vh", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 35,
        duration: 0.3,
      },
    },
    exit: { y: "100vh", opacity: 0, transition: { duration: 0.2 } },
  };
  const shakeVariants = {
    shake: { x: [0, -10, 10, -5, 5, 0], transition: { duration: 0.3 } },
  };

  const asss = ["333", "111", "555"];
  console.log(asss.map((val) => {}));

  const formatNum = (num: number | string): string => {
    if (typeof num === "string") {
      // 콤마 제거 및 숫자로 변환
      num = Number(num.replace(/[^0-9]/g, ""));
    }
    if (isNaN(num) || num === 0) return "";
    return num.toLocaleString("ko-KR");
  };

  const pureAmount = useMemo(() => {
    return Number(input_money.replace(/[^0-9]/g, ""));
  }, [input_money]);

  const quickMoneyAmount = useCallback(
    (val: number) => {
      let amount = pureAmount + val;
      if (amount > MAX_MONEY) {
        amount = MAX_MONEY;
        set_error(`최대 결제 금액은 ${formatNum(MAX_MONEY)}원 입니다.`);
        set_shake_key((prev) => prev + 1);
      } else {
        set_error("");
      }
      set_input_money(String(amount));
    },
    [pureAmount]
  );

  const moneyInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/[^0-9]/g, "");

      if (Number(value) > MAX_MONEY) {
        if (Number(input_money) === MAX_MONEY) {
          set_shake_key((prev) => prev + 1);
          return;
        }
        set_error("최대 결제 금액은 ()");
        value = String(MAX_MONEY);
        set_shake_key((prev) => prev + 1);
      } else {
        set_error("");
      }
      set_input_money(value);
    },
    [input_money]
  );
  const QuickAmountButtons = () => (
    <div className="grid grid-cols-3 gap-x-3">
      {SELECT_PM_NUM.map((amount) => (
        <button
          key={amount}
          onClick={() => quickMoneyAmount(amount)}
          className="bg-gray-300 rounded-xl hover:cursor-pointer hover:font-semibold"
        >
          +{formatNum(amount)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-50 z-50 ">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-4/5 max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        ???
        <QuickAmountButtons />
        <div className="">최 대 {MAX_MONEY} 원 까지 힙력 가능합니다</div>
        <div>{current_host_nickname} 유저에게 입금됩니다.</div>
        <motion.div
          key={shake_key}
          variants={shakeVariants}
          animate={error ? "shake" : ""}
          className="relative"
        >
          <input
            type="text"
            inputMode="numeric"
            value={formatNum(input_money)}
            onChange={moneyInputChange}
            placeholder="0"
            ref={pay_ref}
          ></input>
        </motion.div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500 text-sm mt-1 mb-4 text-center font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={pay} // 결제 진행 함수 호출
        >
          결제 진행
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2
              "
          onClick={() => set_is_pm_modal_open(false)}
        >
          취소
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
