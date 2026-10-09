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
