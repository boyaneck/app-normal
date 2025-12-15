import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useImage } from "@/hooks/useImage";
import { useDropzone } from "react-dropzone";
const ThumbUpload = () => {
  const [thumb_url, set_thumb_url] = useState<string>("");
  const [preview, set_preview] = useState<boolean>(false);
  const [is_hover, set_is_hover] = useState<boolean>(false);
  const {
    fileInputRef,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    isDragReject,
  } = useImage();
  //   const onDrop = () => {};
  //   const {
  //     getRootProps,
  //     getInputProps,
  //     isDragAccept,
  //     isDragActive,
  //     isDragReject,
  //   } = useDropzone({
  //     onDrop,
  //     accept: {
  //       "image/jpeg": [],
  //       "image/png": [],
  //       "image/wbep": [],
  //     },
  //     maxFiles: 1,
  //     maxSize: 5 * 1024 * 1024,
  //     noKeyboard: true,
  //   });
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
     transition-all duration-300 ease-out transform
            hover:scale-[1.01] active:scale-[0.98] 
      ${
        is_hover
          ? "border-2 border-dashed border-gray-400 rounded-lg"
          : "border-2 border-dashed rounded-lg"
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full h-full flex flex-col items-center justify-center group:
            bg-gray-100 group-hover:bg-white
            transition-all duration-300 ease-in-out
             will-change-transform
             `}
          >
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
            >
              <ImageIcon
                size={40}
                className="text-white group-hover:text-gray-400"
              />
            </motion.div>
            <p>
              이미지를 드래그 하거나
              <span className="text-blue-500"> 클릭 </span>하세요
            </p>

            <p className=" text-xs text-gray-400">16:9 비율 권장 (1280x720)</p>
            <div className="border border-red-100"></div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThumbUpload;
