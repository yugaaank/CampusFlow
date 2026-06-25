# 🛠️ Fix: "Could not find the table 'public.tasks'" Error

## What's the Problem?
The app is working, but it can't save or load tasks because the `tasks` table
doesn't exist yet in your Supabase database. You need to create it once manually.

---

## ✅ Step-by-Step Fix (Takes ~1 minute)

### Step 1 — Go to the Supabase SQL Editor

Open this link in your browser (you must be logged into Supabase):

👉 https://supabase.com/dashboard/project/xemxnaduingmalkrtfkf/sql/new

> If it asks you to log in, log in with your Supabase account first, then open the link again.

---

### Step 2 — Paste this SQL

Once you're in the SQL editor, click inside the text area and paste the entire block below:

```sql
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
```

---

### Step 3 — Run It

Click the green **"Run"** button at the bottom right of the editor.

You should see:

```
Success. No rows returned.
```

That means it worked! ✅

---

### Step 4 — Test the App

1. Go back to: http://localhost:3000/dashboard/tasks
2. Click **"Add Task"**
3. Fill in a title (e.g. "Submit OS Assignment") and click **"Add Task"**
4. The task should now appear in the list instantly ✅

---

## ❓ Why Can't This Be Done Automatically?

Creating tables requires **database admin access** (Service Role Key).
The credentials provided (`SUPABASE_ANON_KEY`) are a **read/write key** — it
can only read and write data to tables that already exist, not create new ones.
Only you (the project owner) can create tables through the Supabase dashboard.

---

## 🔁 Also Fix: `profiles` Table Missing

While you're in the SQL editor, also run this to fix the registration error:

```sql
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  phone text,
  branch text,
  year integer,
  subjects text[],
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile" on profiles
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new user registers
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## Summary of Tables to Create

| Table      | Purpose                          | Status       |
|------------|----------------------------------|--------------|
| `tasks`    | Stores all user tasks            | ❌ Missing — create it |
| `profiles` | Stores user profile info         | ❌ Missing — create it |

Once both are created, the entire app will work end-to-end! 🚀
