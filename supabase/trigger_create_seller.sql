-- Yeni kullanıcı kayıt olunca otomatik sellers kaydı oluşturur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.sellers (id, email, shop_name, plan, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'shop_name', 'Mağazam'),
    'temel',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
