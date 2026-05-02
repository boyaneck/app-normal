import express from "express";
import axios from "axios";
import { AIChatPrompt } from "../prompt/AI-chat-prompt.js";
import { AILiveReportPrompt } from "../prompt/AI-live-report-prompt.js";

const router = express.Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const groqHeaders = () => ({
  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  "Content-Type": "application/json",
});

/**
 * POST /ai/chat
 * 카드 선택 후 실시간 채팅
 *
 * body: {
 *   cardTitle, currentValue, prevValue, unit,
 *   messages: [{ role: "user"|"ai", content: string }]  // 최근 6개
 * }
 */
router.post("/chat", async (req, res) => {
  try {
    const {
      cardTitle,
      currentValue,
      prevValue,
      unit,
      messages = [],
    } = req.body;

    const systemPrompt = AIChatPrompt(cardTitle, currentValue, prevValue, unit);

    // 최근 6개만 슬라이딩 윈도우
    const recentMessages = messages.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    const { data } = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages,
        ],
      },
      { headers: groqHeaders() },
    );

    const answer =
      data.choices?.[0]?.message?.content ?? "답변을 가져오지 못했습니다.";
    res.json({ answer });
  } catch (err) {
    console.error("[AI Chat]", err.response?.data ?? err.message);
    res.status(500).json({ error: "AI 응답 실패" });
  }
});

/**
 * POST /ai/analyze
 * 방송 종료 후 전체 통계 분석
 *
 * body: { current: {...}, prev: {...} | null }
 */
router.post("/analyze", async (req, res) => {
  try {
    const { current, prev } = req.body;

    const prompt = AILiveReportPrompt(current, prev);

    const { data } = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
      },
      { headers: groqHeaders() },
    );

    const answer =
      data.choices?.[0]?.message?.content ?? "분석 결과를 가져오지 못했습니다.";
    res.json({ answer });
  } catch (err) {
    console.error("[AI Analyze]", err.response?.data ?? err.message);
    res.status(500).json({ error: "AI 분석 실패" });
  }
});

export default router;
