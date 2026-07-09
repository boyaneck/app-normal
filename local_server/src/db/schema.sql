-- highlights 테이블: 방송 하이라이트 클립 메타데이터
-- Supabase SQL Editor에서 실행하거나 마이그레이션으로 적용

CREATE TABLE IF NOT EXISTS highlights (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name             TEXT        NOT NULL,
  type                  TEXT        NOT NULL,  -- 'viewer_spike' | 'donation_spike' | 'chat_spike'
  public_url            TEXT        NOT NULL,  -- Supabase Storage 공개 URL
  storage_path          TEXT        NOT NULL,  -- Storage 내부 경로 (삭제 등에 사용)
  highlight_started_at  INTEGER     NOT NULL,  -- 방송 시작 기준 스파이크 발생 시각 (초)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS highlights_room_name_idx ON highlights (room_name);
CREATE INDEX IF NOT EXISTS highlights_started_at_idx ON highlights (highlight_started_at DESC);

-- Storage 버킷 설정 (Supabase 대시보드에서 직접 생성하거나 아래 SQL 실행)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('clips', 'clips', true);

-- ============================================================
-- auth.users <-> public.users id 동기화
-- Supabase SQL Editor에서 실행. auth.users에 새 유저가 생성되면
-- (소셜 로그인 최초 가입) public.users에도 동일한 id로 프로필 row를 자동 생성한다.
-- ============================================================

-- public.users.id를 auth.users.id를 참조하는 FK로 고정
-- (기존 public.users row가 있다면 auth.users와 id가 안 맞아 실패할 수 있음 -> 먼저 truncate 후 진행)
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id)
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, user_email, user_nickname, avatar_url, "isLive")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'user_nickname',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'false'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
