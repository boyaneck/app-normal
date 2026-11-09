"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getAIReport } from "@/api/live";

/**
 * 방송 종료 후 AI 리포트 카드
 * 리포트는 서버가 방송 종료 직후 "비동기로" 만든다 → 처음에는 없을 수 있다.
 * 없으면 5초마다 다시 확인하고, 3분이 지나도 없으면 확인을 멈춘다.
 *
 * (예전에는 서버가 리포트를 만들어 ai_reports에 저장해도 화면 어디에서도 읽지 않았다)
 */
const POLL_MS = 5000;
const MAX_POLLS = 36;

interface Props {
  liveStatsId?: number | string;
  startedAt?: string;
}

const AIReportCard = ({ liveStatsId }: Props) => {
  const [pollCount, setPollCount] = useState(0);

  const { data: report } = useQuery({
    queryKey: ["aiReport", liveStatsId],
    queryFn: async () => {
      setPollCount((n) => n + 1);
      return getAIReport(liveStatsId);
    },
    enabled: !!liveStatsId,
    refetchInterval: (query) => (query.state.data || pollCount >= MAX_POLLS ? false : POLL_MS),
  });

  // 확인을 멈춘 뒤에는 "분석 중" 대신 "리포트 없음"을 보여준다
  const isWaiting = !report && pollCount < MAX_POLLS;

  return (
    <div
      className="rounded-[22px] px-5 py-4 h-full"
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "0.5px solid rgba(135,206,250,0.35)",
        boxShadow: "0 2px 24px rgba(100,180,255,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      <span
        className="text-[10px] font-semibold tracking-wide block mb-2"
        style={{ color: "rgba(80,160,220,0.85)" }}
      >
        AI 방송 리포트
      </span>

      {!report ? (
        <div className="flex items-center gap-2 text-[12px] text-black/35 py-2">
          {isWaiting && (
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-sky-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          )}
          {isWaiting ? "AI가 이번 방송을 분석하고 있어요..." : "아직 리포트가 없어요"}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2.5 text-[12px] leading-relaxed"
          style={{ color: "rgba(0,0,0,0.6)" }}
        >
          {report.summary && <p className="text-black/75 font-medium">{report.summary}</p>}
          <ReportList title="잘 된 점" items={report.good} color="rgba(16,185,129,0.85)" />
          <ReportList title="개선할 점" items={report.improve} color="rgba(245,158,11,0.9)" />
          <ReportList title="다음 방송 제안" items={report.suggestions} color="rgba(14,165,233,0.9)" />
        </motion.div>
      )}
    </div>
  );
};

const ReportList = ({
  title,
  items,
  color,
}: {
  title: string;
  items?: string[];
  color: string;
}) => {
  if (!items?.length) return null;
  return (
    <div>
      <span className="text-[10px] font-semibold tracking-wide" style={{ color }}>
        {title}
      </span>
      <ul className="mt-0.5 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span style={{ color }}>·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIReportCard;
