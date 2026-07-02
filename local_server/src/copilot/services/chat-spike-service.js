import axios from "axios";
import { makeChatContext } from "../context/chat-context.js";
import { buildChatSpikePrompt, SYSTEM_PROMPT } from "../context/copilot-prompt.js";
import { sendCopilotInsightToHost } from "../../socket/copilot-socket.js";

const groqHeaders = () => ({
  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  "Content-Type": "application/json",
});

export const analyzeChatSpike = async (hostId, spikeData) => {
  try {
    const chatContext = await makeChatContext(hostId);
    if (!chatContext) return;

    const userPrompt = buildChatSpikePrompt(chatContext, spikeData);

    const { data } = await axios.post(
      process.env.GROQ_URL,
      {
        model: process.env.GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      },
      { headers: groqHeaders() },
    );

    const answer = data.choices?.[0]?.message?.content ?? "분석 실패";
    sendCopilotInsightToHost({ hostID: hostId, insightFromGROQ: answer });
  } catch (err) {
    console.error("[CopilotSpike] GROQ 호출 실패:", err.message);
  }
};
