import { LucideIcon, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

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

export interface live_stats_card_props {
  title: string;
  value: string | null | undefined;
  // icon?: React.ElementType | undefined;
  icon?: React.ElementType | undefined;
  positive_color?: string | undefined;
}

export interface weekly_live_stats_props {
  post_live_stats: post_live_stats_props | null;
}
export interface avg_for_week_props {
  avg_viewer: number;
  peak_viewer: number;
  into_chat_rate: string; // toFixed(2) 때문에 string 타입일 가능성 높음
  fund: number;
}
export interface live_stat_count_props {
  post_live_stats: post_live_stats_props | null;
  start: number;
  end: number;
  prefix: string;
  suffix: string;
  duration: number;
  decimal: number;
}
