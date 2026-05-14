"use client";

import { insertAndUpdateLiveInfo } from "@/api";
import { useLiveSettingStore } from "@/store/live-setting";
import useUserStore from "@/store/user";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { IoPlaySharp, IoStopSharp } from "react-icons/io5";

const LiveSettingButton = () => {
  const { desc, title, thumb_url } = useLiveSettingStore((state) => state);
  const { user } = useUserStore((state) => state);
  const [live_setting_done, set_live_setting_done] = useState(false);

  const toggleButton = () => {
    const next = !live_setting_done;
    set_live_setting_done(next);
    if (next) {
      insertAndUpdateLiveInfo({ desc, title, thumb_url, user_id: user?.user_id });
    }
  };

  return (
    <motion.button
      onClick={toggleButton}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="h-11 px-8 rounded-2xl flex items-center justify-center gap-2 text-[13px] font-semibold tracking-tight transition-all duration-300"
      style={{
        background: live_setting_done
          ? "rgba(239,68,68,0.1)"
          : "rgba(56,189,248,0.15)",
        border: live_setting_done
          ? "0.5px solid rgba(239,68,68,0.22)"
          : "0.5px solid rgba(56,189,248,0.35)",
        color: live_setting_done ? "rgba(220,38,38,0.8)" : "rgba(14,165,233,0.9)",
        boxShadow: live_setting_done
          ? "0 2px 12px rgba(239,68,68,0.07)"
          : "0 2px 12px rgba(56,189,248,0.15)",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={live_setting_done ? "stop" : "start"}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          {live_setting_done ? <IoStopSharp size={14} /> : <IoPlaySharp size={14} />}
          {live_setting_done ? "방송 종료" : "방송 시작"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default LiveSettingButton;
