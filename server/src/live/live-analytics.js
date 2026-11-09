import { generateLiveReport } from "./live-report.js";

/**
 * POST /live/live-analytics
 * Supabase DB 웹훅(live_stats insert)이 호출하던 라우트.
 *
 * 이제 AI 리포트는 finalizeLive가 통계 저장 직후 직접 만든다.
 * Supabase 대시보드에 DB 웹훅이 아직 켜져 있어도 문제없도록,
 * 같은 함수를 호출하되 이미 리포트가 있으면 아무것도 하지 않는다(멱등).
 * → Supabase 대시보드에서 해당 DB 웹훅을 꺼도 된다.
 */
export const getLiveAnalytics = async (req, res) => {
  try {
    const { record } = req.body;
    if (!record?.id) return res.status(400).json({ error: "record 없음" });

    await generateLiveReport(record);
    return res.json({ success: true });
  } catch (error) {
    if (error.response?.status === 429) {
      console.error("🚨 LLM API 할당량 초과! 잠시 후 다시 시도하세요.");
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    console.error("분석 중 오류 발생:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
