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
