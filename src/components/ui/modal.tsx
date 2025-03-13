// import React, { useState, useEffect } from "react";
// import ReactDOM from "react-dom";

// const Modal = ({ isOpen, onClose, children, title }) => {
//   const [modalRoot, setModalRoot] = useState(null);

//   useEffect(() => {
//     // Modal root element 생성 (Portal을 위해)
//     const root = document.createElement("div");
//     root.setAttribute("id", "modal-root");
//     document.body.appendChild(root);
//     setModalRoot(root);

//     // Cleanup function (컴포넌트 unmount 시)
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
