import { LucideIcon, LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface LiveInfo {
  category: string | null;
  id: string;
  ingressId: string;
  isLive: boolean;
  serverURL: string;
  streamKey: string;
  title: string;
  userEmail: string;
  userId: string;
  visitor: number;
}

export interface LiveTimerProps {
  liveTimer: string | null;
}
export interface SubProps {
  liveInformation: LiveInfo | undefined;
}

export interface LiveStatsProps {
  broadNum: string;
  avgViewer: string | null;
  peakViewer: string | null;
  fund: string | null;
  intoChatRate: string | null;
  liveStartedAt: string | null;
}
export interface LiveStatsObject {
  postLiveStats: LiveStatsProps | null | undefined;
}

export interface live_stats_card_props {
  title: string;
  value: string | null | undefined;
  // icon?: React.ElementType | undefined;
  icon?: React.ElementType | undefined;
  positive_color?: string | undefined;
}

export interface weekly_live_stats_props {
  afterLiveStats: LiveStatsProps | null;
}
export interface AvgForWeekProps {
  avgViewer: number;
  peakViewer: number;
  intoChatRate: string; // toFixed(2) 때문에 string 타입일 가능성 높음
  fund: number;
}
export interface liveStatsCountProps {
  postLiveStats: LiveStatsProps | null;
  start: number;
  end: number;
  prefix: string;
  suffix: string;
  duration: number;
  decimal: number;
}

// Supabase live_stats 응답을 camelCase로 변환한 타입
export interface PostLiveStats {
  roomName?: string;
  startedAt?: string;
  dayLabel?: string;
  totalVisitors: number;
  avgViewer: string;
  peakViewers: number;
  fund: string;
  intoChatRate: string;
  retentionRate: number;
}

/** @deprecated PostLiveStats 사용 */
export type post_live_stats_props = PostLiveStats;
