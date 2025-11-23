import { supabase } from "../config/supabase.js";
export const postLiveStats = async (
  get_peak_viewer,
  get_fund,
  get_turn_into_chat_rate,
  room_name
) => {
  try {
    // 🔄 all_viewer가 객체 또는 배열이면 문자열로 변환
    // const all_viewers_string = JSON.stringify(get_all_viewer);
    // const room_name_string = room_name.join(",");
    console.log(
      "방송이 끝나면 반드시 여이가 떠야합니다.✅",
      "get_peak_viewer,",
      get_peak_viewer,
      "get_fund,",
      get_fund,
      "get_turn_into_chat_rate,",
      get_turn_into_chat_rate,
      "room_name",
      room_name
    );
    // supabase insert
    const { data, error } = await supabase.from("post_live_stats").insert([
      {
        broad_num: room_name,
        peak_viewer: get_peak_viewer, // 혹시 문자열이면 숫자로
        fund: get_fund,
        into_chat_rate: get_turn_into_chat_rate,
      },
    ]);
    if (error) {
      console.error("❌ supabase insert 에러:", error);
    } else {
      console.log("✅ postLiveStats 저장 완료:", data);
    }
  } catch (err) {
    console.error("❌ postLiveStats 함수 에러:", err);
  }
};

// export const insertTopParti = async (get_top_parti, room_name) => {
//   console.log(" 최대 동시 시청자수,top_parto", get_top_parti, room_name);
// };

// export const insertAvgParti = async (get_avg_parti, room_name) => {
//   console.log(" =평균시청자수,avg", get_avg_parti, room_name);
// };

export const insertAvgKeep = async () => {};
