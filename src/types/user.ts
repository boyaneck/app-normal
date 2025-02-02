declare interface userData {
  user_nickname: string;
  avatar_url: string;
  user_email: string;
  created_at: string;
  isLive: boolean;
  user_id: string;
}

declare interface User {
  id: string;
  name: string;
  user_email: string;
  user_nickname?: string;
  avatar_url: string;
}
