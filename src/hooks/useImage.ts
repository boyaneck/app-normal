import { useCallback, useRef, useState } from "react";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";

export const useImage = () => {
  const [is_process, set_is_process] = useState<boolean>(false);
  const [preview, set_preview] = useState<string | null>(null);
  const [is_drag, set_is_drag] = useState<boolean>(false);
  const [upload_success, set_upload_success] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (accepdted_files: File[], file_rejection: any[]) => {
      //   if (file_rejection.length > 0) {
      //     const { errors } = file_rejection[0];
      //     if (errors[0].code === "file-too-large") {
      //       console.log("파일 크기가 너무 큽니다.");
      //     } else if (errors[0].code === "file-invalid-type") {
      //       console.log("지원하지 않는 파일의 형식");
      //     } else {
      //       console.log("이미지 업로드 중 오류가 발생");
      //     }
      //     return;
      //   }
      //   if (accepdted_files.length > 0) {
      //     const file = accepdted_files[0];
      //     set_is_process(true);
      //     try {
      //       const compressed_prev = await compressImage(file, 800, 0.8);
      //       set_preview(compressed_prev);
      //       set_upload_success(true);
      //     } catch (error) {}
      //   }
    },
    []
  );
  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/wbep": [],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    noKeyboard: true,
  });
  const compressImage = (file: File, max_width: number, quality: number) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        return reject(new Error("File is not an image type."));
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 비율 유지하며 리사이징
          if (width > max_width) {
            height = height * (max_width / width);
            width = max_width;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          // drawImage의 인수는 모두 정수여야 함
          ctx?.drawImage(img, 0, 0, Math.round(width), Math.round(height));

          // 이미지 압축 (JPEG, quality 0.8)
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return {
    preview,
    set_preview,
    is_drag,
    set_is_drag,
    fileInputRef,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    isDragReject,
  };
};
