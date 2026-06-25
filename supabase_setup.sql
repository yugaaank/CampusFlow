create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  subject text,
  description text,
  deadline timestamptz,
  priority text default 'medium',
  completed boolean default false,
  add_to_calendar boolean default false,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users manage own tasks" on tasks
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  phone text,
  branch text,
  year integer,
  subjects text[],
  google_calendar_refresh_token text,
  google_calendar_email text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile" on profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone, branch, year)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'branch',
    (new.raw_user_meta_data->>'year')::integer
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
