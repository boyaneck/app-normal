"use client";

import { insertAndUpdateLiveInfo } from "@/api";
import { useLiveSettingStore } from "@/store/live-setting";
import useUserStore from "@/store/user";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoPlaySharp } from "react-icons/io5";

/**
 * 방송 시작 버튼
 * 저장(썸네일 업로드 포함) → 상태 waiting → 호스트 모니터링 페이지로 이동
 *
 * 예전에는 저장만 하고 페이지 이동이 없었고, 같은 버튼이 "방송 종료"로 토글됐다.
 * 이제 종료는 모니터링 페이지의 "방송 종료" 버튼(서버가 통계까지 정리)이 담당한다.
 * 실제 "방송 중(live)" 표시는 OBS가 연결될 때 서버(LiveKit 웹훅)가 바꾼다.
 */
const LiveSettingButton = () => {
  const { desc, title, thumb_url } = useLiveSettingStore((state) => state);
  const { user } = useUserStore((state) => state);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [is_saving, set_is_saving] = useState(false);
  const [error_msg, set_error_msg] = useState<string | null>(null);

  const startLive = async () => {
    if (is_saving) return;
    set_error_msg(null);

    if (!user?.userId) return set_error_msg("로그인이 필요해요.");
    if (!title.trim()) return set_error_msg("방송 제목을 입력해주세요.");

    set_is_saving(true);
    const result = await insertAndUpdateLiveInfo({
      desc,
      title: title.trim(),
      thumb_url,
      user_id: user.userId,
    });
    set_is_saving(false);

    if (!result.ok) return set_error_msg(result.reason);

    queryClient.invalidateQueries({ queryKey: ["live_list"] });
    queryClient.invalidateQueries({ queryKey: ["LiveUser"] });
    router.push(`/studio/live/${user.userId}`);
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={startLive}
        disabled={is_saving}
        whileHover={is_saving ? undefined : { scale: 1.01 }}
        whileTap={is_saving ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="h-11 px-8 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-semibold tracking-tight transition-all duration-300 disabled:cursor-wait"
        style={{
          background: "rgba(56,189,248,0.15)",
          border: "0.5px solid rgba(56,189,248,0.35)",
          color: "rgba(14,165,233,0.9)",
          boxShadow: "0 2px 12px rgba(56,189,248,0.15)",
          opacity: is_saving ? 0.6 : 1,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={is_saving ? "saving" : "start"}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <IoPlaySharp size={14} />
            {is_saving ? "준비 중..." : "방송 시작"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {error_msg && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[12px] text-red-500/80"
          >
            {error_msg}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSettingButton;
