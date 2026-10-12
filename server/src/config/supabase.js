import { createClient } from "@supabase/supabase-js";

let _supabase = null;

export const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }
  return _supabase;
};

// 기존 코드 호환용
export const supabase = new Proxy({}, {
  get(_, prop) {
    return getSupabase()[prop];
  }
});
