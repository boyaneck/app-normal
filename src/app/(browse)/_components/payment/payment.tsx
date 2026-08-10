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
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import axios from "axios";
import useUserStore from "@/store/user";

const MAX_MONEY = 10000000;
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
    const portone = document.createElement("script");
    portone.src = "https://cdn.portone.io/v2/browser-sdk.js";
    portone.onload = () => {
      set_is_import_loaded(true);
    };
    portone.onerror = () => {
      console.error("PortOne SDK 로딩 실패");
    };
    document.head.appendChild(portone);
    return () => {
      document.head.removeChild(portone);
    };
  }, []);

  const [is_paying, set_is_paying] = useState(false);

  const pay = async () => {
    if (!is_import_loaded) {
      alert("결제 스크립트 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!current_host_id) {
      set_error("후원 대상을 확인할 수 없습니다.");
      return;
    }

    const { PortOne } = window as any;
    if (!PortOne) {
      console.error("PortOne 객체를 가져오는데 실패했습니다.");
      return;
    }

    set_is_paying(true);
    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: `${current_host_nickname}에게 후원`,
        totalAmount: pureAmount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customData: JSON.stringify({
          host_id: current_host_id,
          user: user?.userNickname,
        }),
        customer: {
          fullName: user?.userNickname ?? "익명",
          email: user?.userEmail,
        },
      });

      if (response?.code !== undefined) {
        console.error("결제 실패:", response.message);
        set_error(response.message ?? "결제에 실패했습니다.");
        return;
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/verify`,
        { paymentId: response.paymentId, amount: pureAmount },
      );

      if (!data.success) {
        set_error(data.msg ?? "결제 검증에 실패했습니다.");
        return;
      }

      console.log("후원 완료:", data);
      closeModal();
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      console.log("결제 오류 ", error);
      set_error("결제 처리 중 오류가 발생했습니다.");
    } finally {
      set_is_paying(false);
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
    set_is_pm_modal_open(false);
    set_error("");
    set_input_money(""); // 금액 초기화
    set_shake_key(0); // 쉐이크 키 초기화
  }, [set_is_pm_modal_open]);
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
    [input_money],
  );
  const pmModalVarients = ({
    is_open,
    is_close,
  }: {
    is_open: boolean;
    is_close: () => void;
  }) => {};
  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
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
    exit: {
      y: "100%",
      opacity: 0,
      transition: { duration: 0.5, ease: easeInOut },
    },
  };
  const shakeVariants = {
    shake: { x: [0, -10, 10, -5, 5, 0], transition: { duration: 0.3 } },
  };

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
        set_is_focused_input(true);
        set_shake_key((prev) => prev + 1);
      } else {
        set_error("");
      }
      set_input_money(String(amount));
      set_is_focused_input(true);
    },
    [pureAmount],
  );

  const moneyInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/[^0-9]/g, "");

      if (Number(value) > MAX_MONEY) {
        if (Number(input_money) === MAX_MONEY) {
          set_shake_key((prev) => prev + 1);
          return;
        }
        set_error(`최대 결제 금액은 ${formatNum(MAX_MONEY)}원 입니다.`);
        value = String(MAX_MONEY);
        set_shake_key((prev) => prev + 1);
      } else {
        set_error("");
      }
      set_input_money(value);
    },
    [input_money],
  );
  const QuickAmountButtons = () => (
    <div className="grid grid-cols-3 gap-x-3 text-sm mt-5">
      {SELECT_PM_NUM.map((amount) => (
        <button
          key={amount}
          onClick={() => quickMoneyAmount(amount)}
          className="bg-gray-1 rounded-xl
          border h-11
          flex items-center justify-center
          transition-all duration-500 ease-in-out 
          focus:outline-none
          hover:cursor-pointer hover:font-semibold hover:bg-gray-100 hover
          "
        >
          +{formatNum(amount)}
        </button>
      ))}
    </div>
  );

  const [is_focused_input, set_is_focused_input] = useState<boolean>(false);

  return (
    <AnimatePresence>
      {is_pm_modal_open && (
        // <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-300 bg-opacity-50 z-50 ">
        <motion.div
          className="absolute bottom-24 left-9 bg-white rounded-2xl h-4/5 shadow-2xl w-4/5 max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex items-center justify-center font-bold text-lg mb-2">
            스트리머에게 후원하기
          </div>
          <div className="text-sm">
            이 금액은{" "}
            <span className="font-bold"> {current_host_nickname}</span> 유저에게
            입금됩니다.
          </div>

          <QuickAmountButtons />
          <div className="flex  justify-center items-center"></div>
          <motion.div
            key={shake_key}
            variants={shakeVariants}
            animate={error ? "shake" : ""}
            className="relative"
          >
            <div className="flex flex-col items-center w-full">
              <input
                type="text"
                inputMode="numeric"
                value={formatNum(input_money)}
                onChange={moneyInputChange}
                placeholder="0"
                onFocus={() => set_is_focused_input(true)}
                onBlur={() => set_is_focused_input(false)}
                ref={pay_ref}
                className="w-full text-center outline-none mt-6 font-semibold p-2"
              />
              <div
                className={`
                bg-gray-200 rounded-full h-[2px] 
            transition-all duration-300 ease-out
            ${is_focused_input ? "bg-blue-500 w-3/4" : "w-2/4"}
            `}
              ></div>
            </div>
          </motion.div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-1 mb-1 text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="grid grid-rows-2 gap-y-5 mt-6">
            <div className="">
              <button
                disabled={
                  Number(input_money) > MAX_MONEY ||
                  input_money === "" ||
                  is_paying
                }
                className={`bg-blue-400 shadow-md shadow-blue-300
                transition-all duration-300 ease-in-out
                active:shadow-lg
                w-full
                text-white font-bold py-2 px-4 rounded
                disabled:opacity-40

                ${input_money ? "hover:cursr-pointer hover:bg-blue-600" : ""}
                `}
                onClick={pay} // 결제 진행 함수 호출
              >
                {is_paying
                  ? "결제 처리중..."
                  : `${formatNum(input_money)} 결제`}
              </button>
            </div>

            <div>
              <button
                className="w-full
                
                text-gray-400 font-bold py-2 px-4 rounded
                tansition-all duration-300 ease-in-out
                hover:cursor-pointer hover:font-semibold hover:text-black
                hover:focus:ring-2 hover:focus:ring-gray-300
                hover:bg-gray-100
              "
                onClick={() => {
                  set_is_pm_modal_open(false);
                  set_input_money("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
        // </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentPage;
