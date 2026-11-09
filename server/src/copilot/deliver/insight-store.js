import { supabase } from "../../config/supabase.js";

/**
 * 코파일럿이 보낸 멘트를 기록한다 (copilot_insights 테이블)
 * - 어떤 지표가 얼마나 튀었을 때(metric, z, score), 어떤 의도로(intention), 무슨 말을 했는지(line)
 * - 호스트가 👍/👎를 누르면 feedback 컬럼이 채워진다
 * → 나중에 "어떤 임계값에서 쓸모 있는 멘트가 나왔나"를 데이터로 보고 config.js 값을 조정할 수 있다.
 *
 * 기록 실패는 코파일럿 동작을 막지 않는다 (null 반환 → 피드백 버튼만 비활성)
 */
export const saveInsight = async ({ roomName, event, intention, line }) => {
  try {
    const { data, error } = await supabase
      .from("copilot_insights")
      .insert({
        room_name: roomName,
        metric: event.metric,
        z: Number(event.z.toFixed(2)),
        score: Number(event.score.toFixed(2)),
        value: event.value,
        intention: intention.intention,
        line,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("[Copilot] 인사이트 기록 실패:", error.message);
    return null;
  }
};

/**
 * 호스트 피드백 저장. room_name까지 조건에 넣어서, 다른 방의 인사이트는 건드릴 수 없게 한다.
 * @param {"up" | "down"} feedback
 */
export const saveFeedback = async ({ roomName, insightId, feedback }) => {
  if (!["up", "down"].includes(feedback)) return false;
  const { error } = await supabase
    .from("copilot_insights")
    .update({ feedback })
    .eq("id", insightId)
    .eq("room_name", roomName);

  if (error) {
    console.error("[Copilot] 피드백 저장 실패:", error.message);
    return false;
  }
  return true;
};
