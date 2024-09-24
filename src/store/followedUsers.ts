import { create } from "zustand";

interface userState2 {
  user2: any[] | null | undefined;
  setUser2: (user2: any[] | null | undefined) => void;
}

const useFollowedUserStore = create<userState2>((set) => ({
  user2: null,
  setUser2: (user2) => set({ user2 }),
}));

export default useFollowedUserStore;
