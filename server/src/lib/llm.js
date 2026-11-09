import axios from "axios";

/**
 * LLM 호출을 한 곳으로 모은 함수 (Groq, OpenAI 호환 API)
 * - 예전에는 리포트는 Gemini, 나머지는 Groq로 나뉘어 있어서 키/에러 처리가 두 벌이었다.
 * - json: true 이면 응답을 JSON 객체로 강제하고 파싱까지 해서 돌려준다.
 */
export const chatCompletion = async ({
  messages,
  json = false,
  timeout = 15000,
  temperature,
}) => {
  const { data } = await axios.post(
    process.env.GROQ_URL?.trim(),
    {
      model: process.env.GROQ_MODEL,
      messages,
      ...(temperature !== undefined && { temperature }),
      ...(json && { response_format: { type: "json_object" } }),
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout,
    },
  );

  const content = data.choices?.[0]?.message?.content ?? null;
  if (!json || content == null) return content;

  try {
    return JSON.parse(content);
  } catch {
    // 모델이 JSON 앞뒤에 글자를 붙인 경우를 대비해 { ... } 부분만 다시 파싱
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("LLM 응답이 JSON 형식이 아닙니다.");
    return JSON.parse(match[0]);
  }
};
