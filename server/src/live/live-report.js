import { chatCompletion } from "../lib/llm.js";
import { AILiveReportPrompt } from "../prompt/AI-live-report-prompt.js";
import { getPrevLive, hasAIReport, insertAIReports } from "../api/live.js";

// Supabase row(snake_case) → 프롬프트가 기대하는 camelCase
export const toReportInput = (d) =>
  d
    ? {
        avgViewer: d.avg_viewer,
        peakViewers: d.peak_viewers,
        totalVisitors: d.total_visitors,
        fund: d.fund,
        intoChatRate: d.into_chat_rate,
        retentionRate: d.retention_rate,
        durationMin: d.duration_min,
        category: d.category,
      }
    : null;

/**
 * 방송 1회(live_stats row)에 대한 AI 리포트 생성 → ai_reports 저장
 * - finalizeLive가 통계 저장 직후 "기다리지 않고" 호출한다 (리포트가 늦어도 종료는 바로 끝나도록).
 * - 같은 방송에 대해 두 번 불려도 리포트는 하나만 만든다 (멱등성).
 */
export const generateLiveReport = async (statsRow) => {
  if (!statsRow?.id) return null;
  if (await hasAIReport(statsRow.id)) return null;

  const prev = await getPrevLive(statsRow.room_name, statsRow.started_at);
  const prompt = AILiveReportPrompt(toReportInput(statsRow), toReportInput(prev));

  const report = await chatCompletion({
    messages: [{ role: "user", content: prompt }],
    json: true,
    timeout: 30000,
    temperature: 0.7,
  });

  if (!report) throw new Error("리포트 생성 결과가 비어 있습니다.");
  await insertAIReports(statsRow.room_name, report, statsRow.id);
  console.log(`[LiveReport] ${statsRow.room_name} 리포트 저장 완료 (live_stats_id=${statsRow.id})`);
  return report;
};
