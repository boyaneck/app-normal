import { create } from "zustand";

interface videoControlProps {
  is_playing: boolean;
  set_is_playing: (val: boolean) => void;
  togglePlayButton: () => void;
}

export const useVideoStore = create<videoControlProps>((set) => ({
  is_playing: true,
  set_is_playing: (val) => set({ is_playing: val }),
  togglePlayButton: () => set((state) => ({ is_playing: !state.is_playing })),
}));
