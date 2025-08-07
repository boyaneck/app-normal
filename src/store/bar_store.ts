import { create } from "zustand";

interface sidebarStore {
  collapsed: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}
interface streamerInfoBarProps {}

export const useSidebarStore = create<sidebarStore>((set) => ({
  collapsed: false,
  onExpand: () => set(() => ({ collapsed: false })),
  onCollapse: () => set(() => ({ collapsed: true })),
}));

export const streamerInfoBarStore = create<streamerInfoBarProps>((set) => ({
  show_streamer_info_bar: false,
  streamer_info_items: [],

  set_show_streamer_info_bar: (show: boolean) =>
    set({ show_streamer_info_bar: show }),
  set_streamer_info_items: (item) => set({ streamer_info_items: item }),
}));
// export type bar_state = "chat" | "setting" | "streamer_info";
export type bar_state = "chat" | "setting" | "streamer";
interface streamingBarProps {
  icon: bar_state[];

  // open: (item: streamingBarActiveProps) => void;
  // close: (item: streamingBarActiveProps) => void;
  // close_all: (item: streamerInfoBarProps) => void;
  toggle: (icon: bar_state) => void;
}

export const useStreamingBarStore = create<streamingBarProps>((set) => ({
  icon: [],
  toggle: (icon) =>
    set((state) => {
      const selected_icon = new Set(state.icon);
      if (selected_icon.has(icon)) {
        selected_icon.delete(icon);
      } else {
        selected_icon.add(icon);
      }
      return { icon: Array.from(selected_icon) };
    }),
}));
