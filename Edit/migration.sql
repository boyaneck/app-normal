-- =====================================================================
-- 2026-11-06 방송 시작/종료/통계/코파일럿 수정에 필요한 DB 변경
-- Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 실행하세요.
-- 여러 번 실행해도 안전하도록 IF NOT EXISTS 를 사용했습니다.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) live_information: 방송 상태(status) + 시작 시각
--    ready → waiting(OBS 대기) → live → ending(통계 정리 중) → ended
-- ---------------------------------------------------------------------
alter table public.live_information
  add column if not exists status text not null default 'ready',
  add column if not exists started_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'live_information_status_check'
  ) then
    alter table public.live_information
      add constraint live_information_status_check
      check (status in ('ready', 'waiting', 'live', 'ending', 'ended'));
  end if;
end $$;

-- 방송 설정 저장은 upsert(onConflict: user_id) → user_id 에 unique 제약이 꼭 있어야 한다.
-- (2026-11-09 확인: 제약이 없어서 저장이 항상 42P10 에러로 실패하고 있었다. 원래 코드부터 그랬음)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'live_information_user_id_key'
  ) then
    alter table public.live_information
      add constraint live_information_user_id_key unique (user_id);
  end if;
end $$;

create index if not exists live_information_status_idx
  on public.live_information (status);

-- 기존 is_live 컬럼이 있다면: 기존 값 이관 + status와 자동 동기화 (예전 코드 호환용)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'live_information' and column_name = 'is_live'
  ) then
    update public.live_information set status = 'live' where is_live = true and status = 'ready';

    create or replace function public.sync_is_live_from_status()
    returns trigger language plpgsql as $f$
    begin
      new.is_live := (new.status = 'live');
      return new;
    end;
    $f$;

    drop trigger if exists live_information_sync_is_live on public.live_information;
    create trigger live_information_sync_is_live
      before insert or update of status on public.live_information
      for each row execute function public.sync_is_live_from_status();
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2) ai_reports: 어느 방송(live_stats)의 리포트인지 연결
--    (실제 DB 확인 결과 live_stats.id 는 uuid)
-- ---------------------------------------------------------------------
alter table public.ai_reports
  add column if not exists live_stats_id uuid references public.live_stats (id) on delete cascade;

create unique index if not exists ai_reports_live_stats_id_key
  on public.ai_reports (live_stats_id);


-- ---------------------------------------------------------------------
-- 3) copilot_insights: 코파일럿 멘트 기록 + 호스트 👍/👎 피드백
-- ---------------------------------------------------------------------
create table if not exists public.copilot_insights (
  id          bigint generated always as identity primary key,
  room_name   text not null,
  metric      text not null,              -- chat | donation | viewer
  z           numeric,
  score       numeric,
  value       integer,
  intention   text,
  line        text not null,
  feedback    text check (feedback in ('up', 'down')),
  created_at  timestamptz not null default now()
);

create index if not exists copilot_insights_room_idx
  on public.copilot_insights (room_name, created_at desc);


-- ---------------------------------------------------------------------
-- 4) [더 이상 필요 없음 · 2026-11-10] Storage 썸네일 버킷
--    썸네일은 다시 live_information.thumb_url 에 압축 이미지로 저장하기로 해서 Storage를 쓰지 않는다.
--    이미 실행했어도 문제없다. 지우고 싶으면 대시보드 Storage에서 thumbnails 버킷을 삭제.
--    업로드 경로: thumbnails/{user_id}/{timestamp}.jpg
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

drop policy if exists "thumbnails: owner can upload" on storage.objects;
create policy "thumbnails: owner can upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "thumbnails: owner can update" on storage.objects;
create policy "thumbnails: owner can update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ---------------------------------------------------------------------
-- 5) (권장, 선택) RLS — 지금 RLS가 꺼져 있다면 서비스 동작 확인 후 켜세요.
--    켜기 전에 서버 .env 에 SUPABASE_SERVICE_ROLE_KEY 를 꼭 넣어야
--    서버(웹훅)가 status / live_stats / ai_reports / copilot_insights 를 쓸 수 있습니다.
-- ---------------------------------------------------------------------
-- alter table public.live_information enable row level security;
-- create policy "live_information: anyone can read"
--   on public.live_information for select using (true);
-- create policy "live_information: owner can insert"
--   on public.live_information for insert to authenticated
--   with check (user_id = auth.uid());
-- create policy "live_information: owner can update"
--   on public.live_information for update to authenticated
--   using (user_id = auth.uid())
--   with check (user_id = auth.uid() and status in ('ready', 'waiting'));
--   -- ↑ 브라우저는 waiting 까지만 바꿀 수 있고, live/ending/ended 는 서버만 바꿀 수 있게 된다
--
-- alter table public.copilot_insights enable row level security;  -- 서버(service role)만 접근
-- alter table public.payments enable row level security;
-- create policy "payments: host can read own" on public.payments
--   for select to authenticated using (host_id::text = auth.uid()::text);
