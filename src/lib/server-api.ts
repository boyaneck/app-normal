import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Express 서버 주소 (예전에는 http://localhost:3001 이 여러 파일에 하드코딩되어 배포 환경에서 동작하지 않았다)
 */
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

/**
 * 로그인한 사용자의 Supabase access token을 Authorization 헤더로 만든다.
 * Express 서버는 이 토큰을 Supabase에 검증받아 "누가 요청했는지"를 직접 확인한다.
 * (userId를 body로 보내면 조작할 수 있기 때문)
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const supabase = createClientComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("로그인이 필요합니다.");
  return { Authorization: `Bearer ${session.access_token}` };
};
