import { insertAndUpdateLiveInfo } from "@/api";
import { useLiveSettingStore } from "@/store/live_setting_store";
import useUserStore from "@/store/user";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, Square } from "lucide-react";
import React, { useState } from "react";
motion;

const LiveSettingButton = () => {
  const { desc, title, thumb_url } = useLiveSettingStore((state) => state);
  const { user } = useUserStore((state) => state);
  const [live_setting_done, set_live_setting_done] = useState<boolean>(false);

  const toggleButton = () => {
    const next = !live_setting_done;
    set_live_setting_done(next);

    if (next === true) {
      const obj = { desc, title, thumb_url, user_id: user?.user_id };
      insertAndUpdateLiveInfo(obj);
    }
  };
  return (
    <motion.div>
      {" "}
      <motion.button
        onClick={toggleButton}
        className={`relative w-64 h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-2xl overflow-hidden
            ${
              live_setting_done
                ? "bg-gradient-to-r from-red-200 to-rose-300"
                : "bg-gradient-to-r from-blue-200 to-blue-300"
            }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {/* Icon Animation */}
        <motion.div
          key={live_setting_done ? "stop" : "start"}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {live_setting_done ? (
            <Square size={22} fill="currentColor" />
          ) : (
            <Settings size={22} />
          )}
        </motion.div>

        {/* Text Sliding Animation */}
        <div className="relative h-6 w-24 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={live_setting_done ? "streaming" : "idle"}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center whitespace-nowrap"
            >
              {live_setting_done ? "방송 설정 완료" : "방송 시작"}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default LiveSettingButton;
