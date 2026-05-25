-- Ürün tablosuna eksik kolonlar
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category             text,
  ADD COLUMN IF NOT EXISTS description          text,
  ADD COLUMN IF NOT EXISTS ai_suggestions       text[],
  ADD COLUMN IF NOT EXISTS improved_description text;

-- Ekip üyeleri
CREATE TABLE IF NOT EXISTS public.team_members (
  id          uuid        primary key default gen_random_uuid(),
  seller_id   uuid        not null references public.sellers(id) on delete cascade,
  email       text        not null,
  role        text        not null default 'viewer', -- 'admin' | 'viewer'
  invited_at  timestamptz not null default now(),
  UNIQUE (seller_id, email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage own team"
  ON public.team_members
  USING  (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());
