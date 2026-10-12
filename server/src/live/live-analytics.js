import axios from "axios";
import { getPrevLive, insertAIReports } from "../api/live.js";
import { AILiveReportPrompt } from "../prompt/AI-live-report-prompt.js";

export const getLiveAnalytics = async (req, res) => {
  try {
    console.log("supabase에서 webhook ->getLiveAnalyitics에서 잘 받음 ");
    const { record } = req.body;
    const roomName = record.room_name;
    const prevLive = await getPrevLive(roomName);

    // Supabase webhook record는 snake_case → AILiveReportPrompt가 기대하는 camelCase로 변환
    const toCamel = (d) =>
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

    const prompt = AILiveReportPrompt(toCamel(record), toCamel(prevLive));

    const geminiAPIRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      },
    );

    const report = JSON.parse(
      geminiAPIRes.data.candidates[0].content.parts[0].text,
    );
    if (report) {
      await insertAIReports(roomName, report);
      return res.json({ success: true });
    }

    return res.status(500).json({ error: "리포트 생성 실패" });
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("🚨 Gemini API 할당량 초과! 잠시 후 다시 시도하세요.");
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    }
    console.error("분석 중 오류 발생:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
