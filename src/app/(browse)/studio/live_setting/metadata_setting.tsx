import { useConnectionState } from "@livekit/components-react";
import { Image, Move, Upload } from "lucide-react";
import React, {
  ChangeEvent,
  DragEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";

type drage_event = (e: DragEvent<HTMLInputElement>) => void;

const MetadataSetting = () => {
  const [thumb_url, set_thumb_url] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [is_dragging, set_is_dragging] = useState<boolean>(false);

  const processFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        //메모리 누수 방지
        if (thumb_url) {
          URL.revokeObjectURL(thumb_url);
        }
        set_thumb_url(URL.createObjectURL(file));
        console.log("선택된 파일 ", file.name);
      } else if (file) {
        console.error("오직 이미지 파일만 업로드 가능합니다.");
      }
    },
    [thumb_url]
  );

  const thumbChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const removeThumb = useCallback(() => {
    if (thumb_url) {
      URL.revokeObjectURL(thumb_url);
      set_thumb_url(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [thumb_url]);

  const dragOverThumb: drage_event = useCallback((e) => {
    e.preventDefault();
  }, []);
  const dragEnterThumb: drage_event = useCallback((e) => {
    e.preventDefault();
    set_is_dragging(true);
  }, []);
  const dragLeaveThumb: drage_event = useCallback((e) => {
    e.preventDefault();
    set_is_dragging(false);
  }, []);
  const dropThumb: drage_event = useCallback((e) => {
    e.preventDefault();
    set_is_dragging(false);

    const files = e.dataTransfers.fi;
  }, []);

  return (
    <div>
      <div>
        <label htmlFor="live-title" className="">
          방송제목
        </label>
        <input
          id="live-title"
          type="text"
          placeholder="방송의 제목을 입력하세요."
          maxLength={50}
          className="p-1"
        />
        <p className="text-ts text-gray-400 ">/50</p>
      </div>
      <div>
        <label htmlFor="live-description">방송 설명</label>
        <textarea
          name=""
          id="live-description"
          placeholder="방송에 대한 설명을 입력하세요."
          className="overflow-hidden resize-none"
        />
        <p className=" text-xs text-gray-400 ">/200</p>
      </div>
      <div>
        썸네일 업로드
        <div>
          <Image className="w-4 h-4 " />
        </div>
        <div
          onDragOver={dragOverThumb}
          onDragEnter={dragEnterThumb}
          onDragLeave={dragLeaveThumb}
          onDrop={dropThumb}
          className="border-2 border-dashed rounded-lg p-6 transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            {/* 미리보기 영역 */}
            <div className="w-32 h-20 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden border-gray-500"></div>
            {thumb_url ? (
              <img src={thumb_url} alt="썸네일 미리보기" />
            ) : (
              <div className="w-full h-full flex flex-col text-gray-500 text-ts text-center">
                <Image className="w-5 h-5 " />
                <span>이미지 없음</span>
              </div>
            )}

            <div className="grid grid-cols-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={thumbChange}
                accept="image/*"
                id="thumb-upload-input"
              />
              <div className="text-center text-gray-400 text-sm font-semibold">
                <Move className="w-5 h-5" />
                여기에 파일을 드래그 하거나
              </div>

              <label htmlFor="thumb-upload-input" className="cursor-point ">
                <Upload className="w-4 h-4 mr-2" />
                {thumb_url ? "썸네일 변경" : "클릭하여 파일 선택"}
              </label>
              {thumb_url && (
                <button onClick={removeThumb} className=""></button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>카테고리</div>
      <div></div>
    </div>
  );
};

export default MetadataSetting;
