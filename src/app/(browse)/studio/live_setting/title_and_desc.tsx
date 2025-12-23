import { useLiveSettingStore } from "@/store/live_setting_store";
import React, { useRef, useState } from "react";
type drage_event = (e: React.DragEvent<HTMLDivElement>) => void;

const TitleAndDescription = () => {
  const { title, set_title, desc, set_desc } = useLiveSettingStore(
    (state) => state
  );

  return (
    <div className="">
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
      <div></div>
    </div>
  );
};

export default TitleAndDescription;
