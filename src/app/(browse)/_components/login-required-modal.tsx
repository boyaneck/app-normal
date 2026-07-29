"use client";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
  is_open: boolean;
  onClose: () => void;
}

const modalVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.96 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: {
    y: 20,
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2, ease: easeInOut },
  },
};

// 로그인 안 한 상태에서 채팅/후원처럼 로그인이 필요한 액션을 눌렀을 때 띄우는 확인 모달.
// "예" 누르면 /signin으로 이동, "취소" 누르면 그냥 닫힘.
const LoginRequiredModal = ({ is_open, onClose }: LoginRequiredModalProps) => {
  const router = useRouter();

  const handleConfirm = () => {
    router.push("/signin");
  };

  return (
    <AnimatePresence>
      {is_open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6"
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="text-center font-bold text-lg mb-2">
              로그인이 필요해요
            </div>
            <div className="text-sm text-center text-gray-500 mb-6">
              로그인 하시겠습니까?
            </div>

            <div className="grid grid-rows-2 gap-y-3">
              <button
                onClick={handleConfirm}
                className="bg-blue-400 hover:bg-blue-600 shadow-md shadow-blue-300 transition-all duration-300 ease-in-out active:shadow-lg w-full text-white font-bold py-2 px-4 rounded"
              >
                예
              </button>
              <button
                onClick={onClose}
                className="w-full text-gray-400 font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out hover:cursor-pointer hover:font-semibold hover:text-black hover:bg-gray-100"
              >
                취소
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginRequiredModal;
