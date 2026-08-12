-- Run this in the Supabase SQL Editor once.

create table if not exists public.cbo_records (
  id uuid primary key default gen_random_uuid(),
  organization_name text,
  organization_short_name text,
  office_address text,
  congressional_district text,
  cbo_president_name text,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_mobile text,
  cbo_assessment_status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cbo_records_created_at_idx on public.cbo_records (created_at desc);
create index if not exists cbo_records_org_name_idx on public.cbo_records (organization_name);
create index if not exists cbo_records_short_name_idx on public.cbo_records (organization_short_name);

alter table public.cbo_records enable row level security;

drop policy if exists "Public can insert cbo_records" on public.cbo_records;
create policy "Public can insert cbo_records"
  on public.cbo_records
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can select cbo_records" on public.cbo_records;
create policy "Public can select cbo_records"
  on public.cbo_records
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can update cbo_records" on public.cbo_records;
create policy "Public can update cbo_records"
  on public.cbo_records
  for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Public can delete cbo_records" on public.cbo_records;
create policy "Public can delete cbo_records"
  on public.cbo_records
  for delete
  to anon, authenticated
  using (true);
