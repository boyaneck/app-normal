import { useLiveSettingStore } from "@/store/live_setting_store";
import { useCallback, useRef, useState } from "react";
import Dropzone, { useDropzone, FileRejection } from "react-dropzone";

export const useImage = () => {
  const { thumb_url, set_thumb_url } = useLiveSettingStore((state) => state);
  const [is_drag, set_is_drag] = useState<boolean>(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_msg, set_error_msg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (
    file: File,
    max_width: number,
    quality: number
  ): Promise<string> => {
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
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      set_is_loading(true);
      set_thumb_url("");
      set_error_msg(null);

      if (acceptedFiles.length > 0) {
        try {
          const file = acceptedFiles[0];
          const MAX_WIDTH = 800;
          const QUALITY = 0.8;

          // Canvas를 사용한 리사이징 및 압축 실행
          const compressedDataUrl = await compressImage(
            file,
            MAX_WIDTH,
            QUALITY
          );

          set_thumb_url(compressedDataUrl);
        } catch (error) {
          console.error("Image processing error:", error);
          set_error_msg("이미지 처리 중 오류가 발생했습니다.");
        }
      }
      set_is_loading(false);
    },
    []
  );
  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    isDragReject,
    open,
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

  const removePreview = useCallback(() => {
    set_thumb_url("");
    set_error_msg(null);
  }, []);
  const thumbnailChangeForClick = useCallback(async () => {
    open();
  }, [open]);
  return {
    thumb_url,
    set_thumb_url,
    is_drag,
    set_is_drag,
    fileInputRef,
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragActive,
    isDragReject,
    thumbnailChangeForClick,
    removePreview,
    is_loading,
  };
};
