import axios from "axios";

export const getAIReport = async () => {
  try {
    const { data } = await axios.get("http://localhost:3001/AI");
    return data;
  } catch (error) {
    console.error("getAIReport failed:", error);
    throw error;
  }
};
