import { getPrevLive } from "../api/live";
import { AI_PROMPT } from "../prompt/ai-prompt";

export const getLiveAnalytics = async (req, res) => {
  const { record } = req.body;
  const prevLive = getPrevLive();

  const geminiAPIRes = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}
        `,
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
        responseMimeTyep: "application/json",
      },
    },
  );

  const report = JSON.parse(
    geminiAPIRes.data.candidates[0].content.parts[0].text,
  );
};
