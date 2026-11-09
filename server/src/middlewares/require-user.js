import { supabase } from "../config/supabase.js";

/**
 * Express 라우트용 로그인 검증 미들웨어
 * 브라우저가 보낸 "Authorization: Bearer <Supabase access token>"을 Supabase에 검증받는다.
 *
 * 왜 필요한가: body로 받은 userId/hostId는 사용자가 개발자도구로 마음대로 바꿀 수 있다.
 * 그래서 "누가 요청했는지"는 반드시 서버가 토큰으로 직접 확인한다.
 * 검증에 성공하면 req.user = { id, email } 이 채워진다.
 */
export const requireUser = async (req, res, next) => {
  try {
    const header = req.get("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "로그인이 필요합니다." });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "유효하지 않은 로그인 정보입니다." });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    console.error("[requireUser] 인증 처리 오류:", error.message);
    res.status(401).json({ error: "인증에 실패했습니다." });
  }
};
