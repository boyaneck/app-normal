import axios from "axios";
import { getPrevLive, insertAIReports } from "../api/live.js";
import { AI_PROMPT } from "../prompt/ai-prompt.js";

export const getLiveAnalytics = async (req, res) => {
  try {
    console.log("supabase에서 webhook ->getLiveAnalyitics에서 잘 받음 ");
    const { record } = req.body;
    const roomName = record.room_name;
    const prevLive = await getPrevLive(roomName);

    const geminiAPIRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: AI_PROMPT }],
        },
        contents: [
          {
            parts: [
              {
                text: `현재 방송 데이터:\n${JSON.stringify(record)}\n\n이전 방송:\n${JSON.stringify(prevLive)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
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
