-- ── Схема базы sitkaz ──
-- Выполнить один раз в Supabase: SQL Editor → New query → вставить → Run.
--
-- Две таблицы: кто учится и как продвигается.
-- Прогресс хранится одним объектом jsonb — это тот же формат, что в приложении,
-- поэтому при изменении курса схему базы менять не придётся.

create table if not exists public.users (
  telegram_id   bigint primary key,
  first_name    text,
  last_name     text,
  username      text,
  language_code text,
  reason        text,               -- зачем учит: family | work | live | curious
  goal          integer default 10, -- цель дня, фраз
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

create table if not exists public.progress (
  telegram_id bigint primary key references public.users(telegram_id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create index if not exists progress_updated_at_idx on public.progress (updated_at desc);
create index if not exists users_last_seen_idx     on public.users (last_seen_at desc);

-- Защита: обращаться к таблицам можно только с сервера, служебным ключом.
-- Правил доступа намеренно нет — значит, публичный ключ не получит ничего.
alter table public.users    enable row level security;
alter table public.progress enable row level security;

-- ── Сводка для владельца курса ──
-- Открывается в Supabase: Table Editor → progress_overview
create or replace view public.progress_overview as
select
  u.telegram_id,
  coalesce(u.username, u.first_name)                          as "ученик",
  u.reason                                                    as "цель_обучения",
  u.goal                                                      as "фраз_в_день",
  (select count(*) from jsonb_object_keys(
     coalesce(p.data->'done', '{}'::jsonb)))                  as "уроков_пройдено",
  (select count(*) from jsonb_object_keys(
     coalesce(p.data->'srs', '{}'::jsonb)))                   as "фраз_в_работе",
  coalesce((p.data->>'xp')::int, 0)                           as "высота_м",
  coalesce((p.data->'streak'->>'count')::int, 0)              as "серия_дней",
  u.created_at                                                as "пришёл",
  u.last_seen_at                                              as "был_в_сети"
from public.users u
left join public.progress p on p.telegram_id = u.telegram_id
order by u.last_seen_at desc;

-- Представление по умолчанию работает от имени владельца базы и обходит защиту
-- таблиц. Заставляем его подчиняться тем же правилам и закрываем публичным ролям.
alter view public.progress_overview set (security_invoker = on);
revoke all on public.progress_overview from anon, authenticated;
