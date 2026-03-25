export interface userData {
  userNickname: string;
  avatarURL: string;
  userEmail: string;
  createdAt: string;
  isLive: boolean;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  user_email: string;
  userNickname?: string;
  avatarURL: string;
}
