create table if not exists public.league_celebration_settings (
  id boolean primary key default true check (id),
  celebration_enabled boolean not null default false,
  celebration_message text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid null references public.profiles(id)
);

insert into public.league_celebration_settings (id, celebration_enabled, celebration_message)
values (true, false, '')
on conflict (id) do nothing;

alter table public.league_celebration_settings enable row level security;

drop policy if exists "Authenticated users can read league celebration settings" on public.league_celebration_settings;
create policy "Authenticated users can read league celebration settings"
on public.league_celebration_settings for select
to authenticated
using (true);

drop policy if exists "Admins can insert league celebration settings" on public.league_celebration_settings;
create policy "Admins can insert league celebration settings"
on public.league_celebration_settings for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update league celebration settings" on public.league_celebration_settings;
create policy "Admins can update league celebration settings"
on public.league_celebration_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists league_celebration_settings_set_updated_at on public.league_celebration_settings;
create trigger league_celebration_settings_set_updated_at
before update on public.league_celebration_settings
for each row execute function public.set_updated_at();

grant select, insert, update on public.league_celebration_settings to authenticated;
