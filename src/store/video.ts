import { create } from "zustand";

interface videoControlProps {
  isPlaying: boolean;
  volume: number;
  muted: boolean;

  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  togglePlayButton: (isPlaying: boolean) => void;
}

export const useVideoStore = create<videoControlProps>((set) => ({
  isPlaying: true,
  volume: 100,
  muted: false,

  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  togglePlayButton: (isPlaying) => set({ isPlaying: !isPlaying }),
}));
