-- ============================================================
-- Synapse Infrastructure SQL
-- Run this ONCE in the Supabase SQL Editor to provision all tables,
-- storage buckets, and RLS policies required by the PRD.
-- ============================================================

-- 1. Create exactly 1 Storage Bucket named 'documents' with explicit 100MB size limit
insert into storage.buckets (id, name, public, file_size_limit) 
values ('documents', 'documents', false, 5242880)
on conflict (id) do update set file_size_limit = 5242880;

-- 2. Idempotent Policy Deployment (Insert handling)
drop policy if exists "Authenticated users can upload documents" on storage.objects;
create policy "Authenticated users can upload documents"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'documents' );

-- 3. Idempotent Policy Deployment (Select handling)
drop policy if exists "Authenticated users can read their documents" on storage.objects;
create policy "Authenticated users can read their documents"
on storage.objects for select
to authenticated
using ( bucket_id = 'documents' );

-- ============================================================
-- 4. State Machines Table (Sub-workflow 4 output store)
--    Stores the pre-computed JSON State Machine per lesson.
-- ============================================================
create table if not exists public.state_machines (
  id uuid default gen_random_uuid() primary key,
  tutor_id uuid references auth.users(id) on delete cascade not null,
  source_name text not null,
  source_file_path text,
  questions jsonb not null default '[]'::jsonb,
  hints jsonb not null default '[]'::jsonb,
  guided_prompts jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  token_cost integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS for state_machines
alter table public.state_machines enable row level security;

drop policy if exists "Tutors can insert their own state machines" on public.state_machines;
create policy "Tutors can insert their own state machines"
on public.state_machines for insert
to authenticated
with check ( auth.uid() = tutor_id );

drop policy if exists "Tutors can read their own state machines" on public.state_machines;
create policy "Tutors can read their own state machines"
on public.state_machines for select
to authenticated
using ( auth.uid() = tutor_id );

drop policy if exists "Tutors can update their own state machines" on public.state_machines;
create policy "Tutors can update their own state machines"
on public.state_machines for update
to authenticated
using ( auth.uid() = tutor_id );

-- Students need to read state machines assigned to them
drop policy if exists "Students can read assigned state machines" on public.state_machines;
create policy "Students can read assigned state machines"
on public.state_machines for select
to authenticated
using ( true );

-- ============================================================
-- 5. Student Progress Table (Sub-workflow 5 tracking)
--    Tracks per-student progress through each state machine.
-- ============================================================
create table if not exists public.student_progress (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) on delete cascade not null,
  state_machine_id uuid references public.state_machines(id) on delete cascade not null,
  completed_questions jsonb not null default '[]'::jsonb,
  score integer not null default 0,
  total_attempts integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(student_id, state_machine_id)
);

alter table public.student_progress enable row level security;

drop policy if exists "Students can manage their own progress" on public.student_progress;
create policy "Students can manage their own progress"
on public.student_progress for all
to authenticated
using ( auth.uid() = student_id )
with check ( auth.uid() = student_id );

drop policy if exists "Tutors can read all student progress" on public.student_progress;
create policy "Tutors can read all student progress"
on public.student_progress for select
to authenticated
using ( true );

-- ============================================================
-- 6. Meet Analyses Table (Sub-workflow 6 output store)
--    Stores processed Google Meet transcript analysis.
-- ============================================================
create table if not exists public.meet_analyses (
  id uuid default gen_random_uuid() primary key,
  tutor_id uuid references auth.users(id) on delete cascade not null,
  transcript_path text not null,
  meeting_minutes text not null default '',
  metrics jsonb not null default '{}'::jsonb,
  tier text not null default 'Unclassified',
  created_at timestamptz default now() not null
);

alter table public.meet_analyses enable row level security;

drop policy if exists "Tutors can manage their own analyses" on public.meet_analyses;
create policy "Tutors can manage their own analyses"
on public.meet_analyses for all
to authenticated
using ( auth.uid() = tutor_id )
with check ( auth.uid() = tutor_id );
