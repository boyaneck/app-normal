import { create } from "zustand";

interface userState {
  user: userData | undefined;
  setUser: (user: userState) => void;
}

const useUserStore = create<userState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));

export default useUserStore;
