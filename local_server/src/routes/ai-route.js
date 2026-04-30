import express from "express";
import axios from "axios";
import { AIChatPrompt } from "../prompt/AI-chat-prompt.js";
import { AILiveReportPrompt } from "../prompt/AI-live-report-prompt.js";

const router = express.Router();

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GOOGLE_AI_API_KEY}`;

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

    //이전의 값과 현재 값 비교, 질문에 필요한 최소한의 모델링(질문)이 된
    const queryPrompt = AIChatPrompt(cardTitle, currentValue, prevValue, unit);

    // 최근 6개만 슬라이딩 윈도우
    const recentMessages = messages.slice(-6);

    const chatSession = recentMessages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const { data } = await axios.post(GEMINI_URL, {
      system_instruction: { parts: [{ text: queryPrompt }] },
      contents: chatSession,
    });

    console.log("[AI Chat] Gemini 응답:", JSON.stringify(data, null, 2));
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "답변을 가져오지 못했습니다.";
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

    const { data } = await axios.post(GEMINI_URL, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "분석 결과를 가져오지 못했습니다.";
    res.json({ answer });
  } catch (err) {
    console.error("[AI Analyze]", err.response?.data ?? err.message);
    res.status(500).json({ error: "AI 분석 실패" });
  }
});

export default router;
