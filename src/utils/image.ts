interface props {
  file: File;
  max_width: number;
  quality: number;
}

export const compressImage = ({ file, max_width, quality }: props) => {
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
          height = (height * max_width) / width;
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
