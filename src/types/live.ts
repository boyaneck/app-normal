export interface live_info {
  category: string | null;
  id: string;
  ingress_id: string;
  is_live: boolean;
  server_url: string;
  stream_key: string;
  title: string;
  user_email: string;
  user_id: string;
  visitor: number;
}

export interface live_timer_props {
  streaming_timer: string | null;
}
export interface sub_props {
  live_information: live_info | undefined;
}

export interface post_live_stats_props {
  board_num: string;
  avg_viewer: string | null;
  peak_viewer: string | null;
  fund: string | null;
  into_chat_rate: string | null;
  live_started_at: string | null;
}
export interface post_live_stats_object {
  post_live_stats: post_live_stats_props | null | undefined;
}
