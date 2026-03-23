import { create } from "zustand";

interface followingUserProps {
  following_user: string[] | null;
  setFollowingUser: (following_user: string[] | null) => void;
}

const useFollowingUserStore = create<followingUserProps>((set) => ({
  following_user: null,
  setFollowingUser: (following_user) => set({ following_user }),
}));

export default useFollowingUserStore;
