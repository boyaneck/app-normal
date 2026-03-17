import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, X } from "lucide-react";
import { useImage } from "@/hooks/useImage";
import { useDropzone } from "react-dropzone";
const ThumbUpload = () => {
  const [is_hover, set_is_hover] = useState<boolean>(false);
  const {
    fileInputRef,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    thumb_url,
    isDragReject,
    thumbnailChangeForClick,
    removePreview,
    set_thumb_url,
  } = useImage();

  const clickRemoveButton = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    set_thumb_url("");
  };

  return (
    <div className="">
      <div className="flex justify-between w-1/3 items-center">
        <span>썸네일 업로드</span>
        <span className="text-xs text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
      </div>
      <div
        className={`relative group
        w-1/3 h-[200px]
     hover:cursor-pointer 
     transition-all duration-200 ease-in-out
     ${!thumb_url && "hover:scale-[1.01]"}
      ${
        isDragActive
          ? isDragReject
            ? "border-2 border-dashed border-red-500 rounded-lg bg-red-50"
            : "border-2 border-dashed border-green-500 rounded-lg bg-green-50 "
          : is_hover
          ? "border-2 border-dashed border-gray-400 rounded-lg"
          : "border-2 border-dashed border-gray-200 rounded-lg"
      }

      `}
        onMouseEnter={() => set_is_hover(true)}
        onMouseLeave={() => set_is_hover(false)}
        {...getRootProps()}
      >
        {/* <input {...getInputProps()} ref={fileInputRef} className="hidden" /> */}
        <input {...getInputProps()} className="hidden" />
        <AnimatePresence mode="wait">
          <motion.div
            key={thumb_url ? "uploaded" : "empty"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full h-full  flex flex-col items-center justify-center
             group-hover:bg-white
             transition-all duration-300 ease-out transform
            hover:scale-[1.01] active:scale-[0.98] 
             will-change-transform
            ${isDragActive ? "bg-white" : "bg-gray-100"}
             `}
          >
            {thumb_url ? (
              <motion.div
                className="relative w-full h-full
              "
              >
                <img
                  src={thumb_url}
                  className="w-full h-full object-cover max-w-full max-h-full
                  group-hover:brightness-75 group-hover:blur-[1px]
              transition-all duration-300 ease-in-out"
                />
                <button
                  className="absolute top-3 right-3
                  rounded-full bg-red-400 p-2 text-white
                opacity-0
                group-hover:opacity-80
                hover:cursor-pointer hover:scale-[1.03]
                hover:opacity-100
                transition-all duration-300 ease-in-out
                "
                  onClick={(e) => clickRemoveButton(e)}
                >
                  <X size={18} />
                </button>
              </motion.div>
            ) : (
              <>
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
                  className=" flex flex-col items-center justify-center"
                >
                  <ImageIcon
                    size={40}
                    className={
                      isDragReject
                        ? "text-red-500"
                        : isDragAccept
                        ? "text-green-400"
                        : is_hover
                        ? "text-gray-600"
                        : "text-gray-400"
                    }
                  />
                </motion.div>
                <p>
                  이미지를 <span className="text-blue-500">드래그</span> 하거나
                  <span className="text-blue-500"> 클릭 </span>하세요
                </p>

                <p className=" text-xs text-gray-400">
                  16:9 비율 권장 (1280x720)
                </p>
                <div className="border border-red-100"></div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThumbUpload;
