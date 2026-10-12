-- payments 테이블: 후원 영구 기록 (후원왕 랭킹, 매출 통계 등의 소스 오브 트루스)
-- Redis는 방송 중 실시간 통계용 캐시(TTL 24h)일 뿐이므로, 영구 조회는 이 테이블을 사용한다.
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS payments (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id    TEXT        NOT NULL UNIQUE,  -- PortOne V2 paymentId (멱등성 보장)
  host_id       TEXT        NOT NULL,         -- 후원받은 스트리머의 user id (room name과 동일)
  user_nickname TEXT,                         -- 후원자 닉네임 (비회원/익명 가능)
  amount        TEXT        NOT NULL,         -- 후원 금액 (기존 getTopSupporters가 text로 파싱하므로 text 유지)
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_host_id_idx ON payments (host_id);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON payments (paid_at DESC);
