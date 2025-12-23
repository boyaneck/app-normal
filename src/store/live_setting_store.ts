import { create } from "zustand";

interface live_props {
  title: string;
  set_title: (title: string) => void;
  desc: string;
  set_desc: (desc: string) => void;
  thumb_url: string;
  set_thumb_url: (thumb_url: string) => void;
}

export const useLiveSettingStore = create<live_props>((set, get) => ({
  title: "",
  set_title: (title) => set({ title }),
  desc: "",
  set_desc: (desc) => set({ desc }),
  thumb_url: "",
  set_thumb_url: (thumb_url: string) => set({ thumb_url }),
}));
