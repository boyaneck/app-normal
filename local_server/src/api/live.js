// import { SupabaseClient } from "@supabase/supabase-js";

export const insertAllParti = async (get_all_parti, room_name) => {
  console.log(
    "ㅁ참여한 모든 유저 데이터 넣기,insrtAllparti",
    get_all_parti,
    room_name
  );
};

export const insertTopParti = async (get_top_parti, room_name) => {
  console.log(" 최대 동시 시청자수,top_parto", get_top_parti, room_name);
};

export const insertAvgParti = async (get_avg_parti, room_name) => {
  console.log(" =평균시청자수,avg", get_avg_parti, room_name);
};

export const insertAvgKeep = async () => {};
