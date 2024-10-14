import { create } from "zustand";

interface userState {
  user: userData | null;
  setUser: (user: userData | null) => void;
}


const useUserStore = create<userState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default useUserStore;
