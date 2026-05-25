-- =============================================================================
-- 009_questions.sql
-- Trendyol müşteri soruları tablosu.
-- =============================================================================

create table if not exists questions (
  id                       uuid primary key default gen_random_uuid(),
  seller_id                uuid not null references sellers(id) on delete cascade,
  marketplace              text not null,
  marketplace_question_id  text not null,
  product_id               text,
  product_name             text,
  question                 text not null,
  suggested_answer         text,
  is_answered              boolean not null default false,
  asked_at                 timestamptz not null,
  created_at               timestamptz not null default now(),
  unique (seller_id, marketplace, marketplace_question_id)
);

create index if not exists questions_seller_id_idx  on questions (seller_id);
create index if not exists questions_unanswered_idx on questions (seller_id, is_answered) where is_answered = false;

alter table questions enable row level security;

create policy questions_own on questions
  for all using (auth.uid() = seller_id);
