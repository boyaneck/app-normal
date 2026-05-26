import express from "express";
import axios from "axios";
import { AIChatPrompt } from "../prompt/AI-chat-prompt.js";
import { AILiveReportPrompt } from "../prompt/AI-live-report-prompt.js";
import { getRedisKeys } from "../live/redis-keys.js";

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


router.post("/copilot",async(req,res)=>{
  try {
    const {question,hostId}=req.body
    const keys=getRedisKeys(hostId)

    //키워드 감지 
    const detection=detectKeywords(question)

    
    const systemPrompt=`너는 실시간 라이브 방송의 ai 코파일럿이야.
    보내준 데이터를 기반으로 핵심만 말해줘.
    라이브 중이라 5문장 이하로 답변해줘.
     `
    const userPrompt=`
    [라이브 데이터]
      ${JSON.stringify(context, null, 2)}

      [질문]
       ${question}
    `

    const {data}=await axios.post(GROQ_URL,{model:GROQ_MODEL,messages:[
    {role:"system",content:systemPrompt},
    {role:"user",content:userPrompt},
  ],},{headers:groqHeaders()})

      const answer = data.choices?.[0]?.message?.content ?? "답변을 가져오지 못했습니다.";
      res.json({ answer });


  } catch (error) {
    console.log("AI 코파일럿 실행중 문제 발생🚨 ",error.message)
       res.status(500).json({ error: "AI 코파일럿 응답 실패" });
      }
  
    })
    
    const detectKeywords=(question)=>({
      donation:question.match(/후원|도네이션|후원금|돈|금액|/),
      viewer:question.match(/시청자|뷰어|명/),
      chat:question.match(/채팅|전환율|채팅량|챗/),
      timeseries:question.match(/추이|변화|시계열|흐름/),
      yesterday:question.match(/어제|비교|전날/)
    })
    
    const getDataContext=async (keys,requestion)=>{
      const dataContext={}

  if(requestion.donation){
    dataContext.donation={
      total:  await redis_client.get(keys.DONATION_TOTAL_AMOUNT),
        count:  await redis_client.get(keys.DONATION_COUNT),
}
  }
  if(requestion.viewer){
   dataContext.viewer={
  current: await redis_client.get(keys.VIEWERS),
        peak:    await redis_client.get(keys.PEAK_VIEW),
   }
  }
  if(requestion.chat){
    dataContext.chat={
      chatConversionRate: await redis_client.get(keys.CHAT_UNIQUE_USERS);
    }
  }
  if(requestion.timeseries){
dataContext.timeseries={
   raw : await redis_client.zRange(keys.TIMESERIES, 0, -1);
      dataContext.timeseries = raw.map(JSON.parse);
}
  }

  return dataContext
}


export default router;
