-- Callio Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  accountability_score integer not null default 50,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'overdue')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  category text not null default 'Quick Action',
  due_date date not null,
  due_time text not null default '12:00 PM',
  completed_at timestamptz,
  source text not null default 'text' check (source in ('voice', 'text', 'ai_extracted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can CRUD own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

create index idx_tasks_user_status on public.tasks(user_id, status);
create index idx_tasks_user_date on public.tasks(user_id, due_date);

-- Journal entries
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  mood text,
  source text not null default 'text' check (source in ('voice', 'text')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can CRUD own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);

create index idx_journal_user on public.journal_entries(user_id, created_at desc);

-- Accountability logs
create table public.accountability_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender text not null check (sender in ('ai', 'user')),
  message text not null,
  log_type text not null default 'chat' check (log_type in ('sms', 'call', 'chat', 'lockout')),
  created_at timestamptz not null default now()
);

alter table public.accountability_logs enable row level security;

create policy "Users can CRUD own accountability logs"
  on public.accountability_logs for all
  using (auth.uid() = user_id);

create index idx_logs_task on public.accountability_logs(task_id, created_at);

-- Reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  remind_at timestamptz not null,
  type text not null default 'push' check (type in ('push', 'sms', 'call')),
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Users can CRUD own reminders"
  on public.reminders for all
  using (auth.uid() = user_id);

create index idx_reminders_pending on public.reminders(remind_at) where sent = false;

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

create trigger update_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.update_updated_at();
