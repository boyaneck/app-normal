"use client";

import { useLiveSettingStore } from "@/store/live-setting";

const TitleAndDescription = () => {
  const { title, set_title, desc, set_desc } = useLiveSettingStore((state) => state);

  return (
    <div
      className="rounded-[22px] px-6 py-5 space-y-5"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {/* 방송 제목 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="live-title"
            className="text-[11px] uppercase tracking-[0.12em] font-medium text-black/40"
          >
            방송 제목
          </label>
          <span className="text-[10px] tabular-nums text-black/25">
            <span className={title.length > 0 ? "text-black/60" : ""}>{title.length}</span>
            /50
          </span>
        </div>
        <input
          id="live-title"
          type="text"
          value={title}
          onChange={(e) => set_title(e.target.value)}
          placeholder="방송 제목을 입력하세요"
          maxLength={50}
          className="w-full px-4 py-2.5 rounded-xl text-[13px] text-black/80 placeholder:text-black/20 outline-none transition-all duration-200"
          style={{
            background: title.length > 0 ? "rgba(255,255,255,0.9)" : "rgba(248,248,248,0.9)",
            border: "0.5px solid rgba(0,0,0,0.08)",
          }}
        />
      </div>

      {/* 방송 설명 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="live-description"
            className="text-[11px] uppercase tracking-[0.12em] font-medium text-black/40"
          >
            방송 설명
          </label>
          <span className="text-[10px] tabular-nums text-black/25">
            <span className={desc.length > 0 ? "text-black/60" : ""}>{desc.length}</span>
            /200
          </span>
        </div>
        <textarea
          id="live-description"
          value={desc}
          onChange={(e) => set_desc(e.target.value)}
          placeholder="방송에 대한 설명을 입력하세요"
          maxLength={200}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl text-[13px] text-black/80 placeholder:text-black/20 outline-none resize-none transition-all duration-200"
          style={{
            background: desc.length > 0 ? "rgba(255,255,255,0.9)" : "rgba(248,248,248,0.9)",
            border: "0.5px solid rgba(0,0,0,0.08)",
          }}
        />
      </div>
    </div>
  );
};

export default TitleAndDescription;
