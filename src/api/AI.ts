import axios from "axios";
import { SERVER_URL, getAuthHeaders } from "@/lib/server-api";

/**
 * 방송 중 음성 코파일럿 질문
 * 어느 방송의 데이터를 볼지는 서버가 로그인 토큰으로 정한다 (hostId를 보내지 않음)
 */
export const askAICopilot = async (question: string) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${SERVER_URL}/ai/copilot`, { question }, { headers });
  return data.answer as string;
};

/**
 * 방송 통계 페이지의 AI 채팅
 * 카드 숫자는 서버가 DB에서 직접 읽는다. 프론트는 "어느 방송의 어느 카드인지"만 알려준다.
 */
export const askStatChat = async (payload: {
  liveStatsId?: number | string;
  cardKey?: string;
  cardTitle?: string;
  messages: { role: "user" | "ai"; content: string }[];
}) => {
  const headers = await getAuthHeaders();
  const { data } = await axios.post(`${SERVER_URL}/ai/chat`, payload, { headers });
  return data.answer as string;
};
