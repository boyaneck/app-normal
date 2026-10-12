import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, X } from "lucide-react";
import { useImage } from "@/hooks/useImage"; // useImage 훅의 경로가 맞다고 가정합니다.
import { useDropzone } from "react-dropzone"; // Dropzone 관련 import는 useImage 훅 내에서 처리되므로 여기서는 주석 처리 가능합니다.

const ThumbUpload = () => {
  // useImage 훅에서 필요한 상태와 함수들을 가져옵니다.
  const {
    getRootProps,
    getInputProps,
    isDragAccept, // 드래그 상태에 따른 UI 변경을 위해 유지
    isDragActive, // 드래그 상태에 따른 UI 변경을 위해 유지
    preview, // 압축 및 리사이즈된 이미지 데이터 URL
    isDragReject, // 드래그 상태에 따른 UI 변경을 위해 유지
    removePreview, // 미리보기 제거 함수
    // set_preview는 useImage 내부에서 onDrop으로 관리되므로 외부에서 직접 수정은 지양합니다.
  } = useImage();

  const [is_hover, set_is_hover] = useState<boolean>(false);

  // 미리보기 제거 버튼 클릭 핸들러
  const clickRemoveButton = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation(); // 드롭존 클릭 이벤트 방지
    removePreview(); // useImage 훅의 removePreview 함수 호출
  }, [removePreview]);

  return (
    <div className="">
      <div className="flex justify-between w-1/3 items-center">
        <span>썸네일 업로드</span>
        <span className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
      </div>
      <div
        // 드롭존 영역 설정
        {...getRootProps()}
        className={`relative group
          w-1/3 h-[200px]
          hover:cursor-pointer 
          
          ${
            // 드래그 상태에 따른 시각적 피드백
            isDragActive
              ? isDragReject
                ? "border-2 border-dashed border-red-500 rounded-lg bg-red-50"
                : "border-2 border-dashed border-green-500 rounded-lg bg-green-50"
              : is_hover
              ? "border-2 border-dashed border-gray-400 rounded-lg"
              : "border-2 border-dashed border-gray-200 rounded-lg" // 기본 테두리
          }
          transition-colors duration-200
        `}
        onMouseEnter={() => set_is_hover(true)}
        onMouseLeave={() => set_is_hover(false)}
      >
        {/* 파일 선택 input */}
        <input {...getInputProps()} />
        
        {/* 미리보기 및 비어있을 때 메시지 표시 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={preview ? "uploaded" : "empty"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full h-full flex flex-col items-center justify-center
              bg-gray-100 group-hover:bg-white
              transition-all duration-300 ease-out transform
              will-change-transform
            `}
          >
            {preview ? (
              // 썸네일 미리보기가 있을 때
              <motion.div
                className="relative w-full h-full overflow-hidden rounded-lg"
              >
                <img
                  src={preview}
                  alt="썸네일 미리보기"
                  className="w-full h-full object-cover 
                    group-hover:brightness-75 group-hover:blur-[1px]
                    transition-all duration-300 ease-in-out"
                />
                
                {/* 미리보기 제거 버튼 */}
                <button
                  className="absolute top-3 right-3
                    rounded-full bg-red-500 p-2 text-white
                    opacity-0
                    group-hover:opacity-80
                    hover:cursor-pointer hover:scale-[1.03]
                    hover:opacity-100
                    transition-all duration-300 ease-in-out
                  "
                  onClick={clickRemoveButton}
                >
                  <X size={18} />
                </button>
              </motion.div>
            ) : (
              // 썸네일이 비어있을 때
              <motion.div
                animate={is_hover ? "float" : "initial"}
                variants={{
                  initial: { y: 0 },
                  float: {
                    y: [0, -6, 0],
                    transition: {
                      y: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    },
                  },
                }}
                className="flex flex-col items-center justify-center space-y-2 text-center"
              >
                {/* 드래그 상태에 따른 아이콘 색상 변화 */}
                <ImageIcon
                  size={40}
                  className={
                    isDragReject
                      ? "text-red-500"
                      : isDragAccept
                      ? "text-green-500"
                      : is_hover
                      ? "text-gray-600"
                      : "text-gray-400"
                  }
                />
                <p>
                  이미지를{" "}
                  <span className="text-blue-500 font-semibold">드래그</span> 하거나
                  <br />
                  <span className="text-blue-500 font-semibold"> 클릭 </span>하세요
                </p>

                <p className="text-xs text-gray-400">
                  16:9 비율 권장 (1280x720)
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThumbUpload;