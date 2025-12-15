import { useImage } from "@/hooks/useImage";
import { useConnectionState } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Image, Move, Upload } from "lucide-react";
import React, {
  ChangeEvent,
  DragEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import ThumbUpload from "./thumb_upload";
type drage_event = (e: React.DragEvent<HTMLDivElement>) => void;

const MetadataSetting = () => {
  const { preview, set_preview, is_drag } = useImage();
  // const [preview, set_previewe] = useState<string | null>(null);
  const [is_processing, set_is_processing] = useState<boolean>(false);
  const [upload_up, set_upload_up] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /////////////
  const [thumb_url, set_thumb_url] = useState<string | null>(null);
  const [is_dragging, set_is_dragging] = useState<boolean>(false);

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
        썸네일 업로드
        <ThumbUpload />
      </div>
      <div></div>
    </div>
  );
};

export default MetadataSetting;
