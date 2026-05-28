import axios from "axios";

export const askAICopilot = async (question: string, hostId: string) => {
  const { data } = await axios.post("http://localhost:3001/ai/copilot", {
    question,
    hostId,
  });
  return data.answer as string;
};
