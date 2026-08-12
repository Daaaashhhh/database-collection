-- Run this in the Supabase SQL Editor (in addition to supabase-cbo-records.sql).
-- Needed for edit + delete while the app stays public (no auth).

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
