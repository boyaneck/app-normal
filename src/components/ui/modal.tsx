// import React, { useState, useEffect, ReactNode } from "react";
// import ReactDOM from "react-dom";

// interface modalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title?: string;
//   children: ReactNode;
// }

// const Modal = ({ isOpen, onClose, title, children }: modalProps) => {
//   const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

//   useEffect(() => {
//     const root = document.createElement("div");
//     root.setAttribute("id", "modal-root");
//     document.body.appendChild(root);
//     setModalRoot(root);

//     return () => {
//       document.body.removeChild(root);
//     };
//   }, []);

//   if (!isOpen || !modalRoot) return null;

//   return ReactDOM.createPortal(
//     <div
//       className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-lg shadow-xl w-4/5 max-w-lg p-6"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-semibold">{title || "Modal Title"}</h2>
//           <button
//             className="text-gray-500 hover:text-gray-700 focus:outline-none"
//             onClick={onClose}
//           >
//             <span className="sr-only">Close</span>
//             <svg
//               className="h-6 w-6"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>,
//     modalRoot
//   );
// };

// export default Modal;
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";

interface modalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }:modalProps) => {
  const [modal_root, set_modal_root] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement("div");
    root.setAttribute("id", "modal-root");
    document.body.appendChild(root);
    set_modal_root(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  const memoizedChildren = useCallback(() => children, [children]); // children이 변경될 때만 함수를 새로 생성

  if (!isOpen || !modal_root) return null;

  const modal_variants = {
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

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-4/5 max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        variants={modal_variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ transform: "translateZ(0)" }} // 하드웨어 가속 활성화
        layout // 레이아웃 변화 감지
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">{title || "Modal Title"}</h2>
          <button
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-gray-700">{memoizedChildren()}</div> {/* 렌더링 최적화 */}
      </motion.div>
    </div>,
    modal_root
  );
};

export default Modal;