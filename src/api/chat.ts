import { supabaseForClient } from "@/supabase/supabase_client";

export async function getChatInfo() {
  const { data, error } = await supabaseForClient.from("chat").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertChatInfo({
  user_nickname,
  created_at,
  message,
  avatar_url,
  chat_room_number,
}: chat_props) {
  console.log("api 에서 닉네임이 배열메세지 들어갑니다촙촙촙", user_nickname);
  const user_nickname_array = [];
  const arr =
    user_nickname !== undefined
      ? user_nickname_array.push(user_nickname)
      : "ddd";

  console.log("씨바아아아아아아ㅏㄹ", user_nickname_array);
  const { data, error } = await supabaseForClient.from("chat").insert([
    {
      user_nickname: user_nickname_array,
      avatar_url,
      message,
      created_at,
      chat_room_number,
    },
  ]);

  if (error) {
    console.error("Error inserting chat message:", error);
  } else {
    console.log("Chat message inserted:", data);
  }
}
