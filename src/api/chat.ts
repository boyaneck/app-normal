import { supabaseForClient } from "@/supabase/supabase_client";

export async function getChatInfo() {
  const { data, error } = await supabaseForClient
    .from("chat_room")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertChatInfo({
  user_nickname,
  date,
  message,
  avatar_url,
  current_chat_room_number,
}: props_message_info) {
  console.log(
    "API 에서 확인하기",
    user_nickname,
    date,
    message,
    avatar_url,
    current_chat_room_number
  );
  const { data, error } = await supabaseForClient.from("chat_room").insert([
    {
      user_nickname: "진민용",
      date,
      avatar_url,
      message,
      current_chat_room_number,
    },
  ]);

  if (error) {
    console.error("Error inserting chat message:", error);
  } else {
    console.log("Chat message inserted:", data);
  }
}
