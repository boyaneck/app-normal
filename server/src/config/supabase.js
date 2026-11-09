import { createClient } from "@supabase/supabase-js";

let _supabase = null;

// 서버는 "믿을 수 있는 곳"이므로 RLS를 우회할 수 있는 service role 키를 우선 사용한다.
// (방송 상태 변경, 통계 저장처럼 브라우저가 하면 안 되는 쓰기 작업을 서버가 대신 하기 때문)
// service role 키가 없으면 기존처럼 anon 키로 동작한다.
// ⚠️ service role 키는 절대 프론트(.env.local의 NEXT_PUBLIC_*)에 두면 안 된다.
export const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
      { auth: { persistSession: false } },
    );
  }
  return _supabase;
};

// 기존 코드 호환용
export const supabase = new Proxy(
  {},
  {
    get(_, prop) {
      return getSupabase()[prop];
    },
  },
);
