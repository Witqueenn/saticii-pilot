create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

create policy "waitlist_insert" on waitlist
  for insert with check (true);
