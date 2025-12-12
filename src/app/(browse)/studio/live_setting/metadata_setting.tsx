import { useConnectionState } from "@livekit/components-react";
import { Image, Move, Upload } from "lucide-react";
import React, {
  ChangeEvent,
  DragEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";

type drage_event = (e: React.DragEvent<HTMLDivElement>) => void;

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
  }, []);

  const [title, set_title] = useState<string>("");
  const [desc, set_desc] = useState<string>("");

  return (
    <div className="ml-2">
      <div className="flex flex-col ">
        <div className="flex justify-between w-2/4 items-center">
          <label htmlFor="live-title" className="">
            방송제목
          </label>
          <p className="text-xs text-gray-400 items-end">
            {title.length > 0 ? (
              <span className="text-black">{title.length}</span>
            ) : (
              0
            )}
            /50
          </p>
        </div>

        <input
          id="live-title"
          type="text"
          value={title}
          onChange={(e) => set_title(e.target.value)}
          placeholder="방송의 제목을 입력하세요."
          maxLength={50}
          className={`p-1 pl-2 w-2/4 rounded-lg border-none 
            ${title.length > 0 ? "bg-white" : "bg-gray-100"}`}
        />
        <div>
          <div className="flex justify-between w-2/4 mt-2 items-center">
            <label htmlFor="live-description">방송 설명</label>
            <p className=" text-xs text-gray-400 text-">
              {desc.length > 0 ? (
                <span className="text-black">{desc.length}</span>
              ) : (
                0
              )}
              /200
            </p>
          </div>
          <textarea
            name=""
            id="live-description"
            value={desc}
            onChange={(e) => set_desc(e.target.value)}
            placeholder="방송에 대한 설명을 입력하세요."
            className={`overflow-hidden resize-none w-2/4 h-[150px] rounded-lg p-2
              ${desc.length > 0 ? "bg-white" : "bg-gray-100"}
              `}
          />
        </div>
      </div>
      <div>
        썸네일 업로드
        <div
          onDragOver={dragOverThumb}
          onDragEnter={dragEnterThumb}
          onDragLeave={dragLeaveThumb}
          onDrop={dropThumb}
          className="border-2 border-dashed rounded-lg p-6 transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            {/* 미리보기 영역 */}
            <div className="w-32 h-20 flex-shrink-0 bg-gray-300 rounded-lg overflow-hidden border-gray-500"></div>
            {thumb_url ? (
              <img src={thumb_url} alt="썸네일 미리보기" />
            ) : (
              <div className="w-full h-full flex flex-col text-gray-400 text-ts text-center">
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
