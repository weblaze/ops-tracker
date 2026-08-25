create extension if not exists pgcrypto;

create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create type yesterday_status as enum ('Completed', 'Partial', 'Not Started');
create type support_status as enum ('No', 'Yes-Urgent', 'Yes-Can wait');

create table daily_updates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id),
  employee_name text not null,
  department text not null,
  project_id uuid not null references projects(id),
  project_name text not null,
  submitted_date date not null default current_date,
  yesterday_status yesterday_status not null,
  yesterday_detail text,
  today_plan text not null,
  blocked boolean not null default false,
  blocked_reason text,
  blocked_tag_department text,
  payment_pending boolean not null default false,
  payment_note text,
  client_decision boolean not null default false,
  client_note text,
  support_status support_status not null default 'No',
  support_who text,
  support_detail text,
  created_at timestamptz not null default now()
);

create index idx_daily_updates_date on daily_updates(submitted_date);

create type lead_priority as enum ('Hot', 'Warm', 'Cold');
create type lead_stage as enum ('New', 'Site Visit', 'Quotation', 'Negotiation', 'Won', 'Lost', 'Hold');

create table lead_counters (
  year int primary key,
  last_seq int not null default 0
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  lead_id text unique not null,
  created_date date not null default current_date,
  captured_by text not null,
  clinic_name text not null,
  city text not null,
  contact_person text not null,
  mobile text not null,
  lead_source text not null,
  requirement text[] not null default '{}',
  priority lead_priority not null,
  assigned_to text not null,
  stage lead_stage not null default 'New',
  next_followup_date date not null,
  next_action text not null,
  updated_at timestamptz not null default now()
);

create index idx_leads_followup on leads(next_followup_date);
create index idx_leads_priority on leads(priority);

-- Generates DM-2026-XXX, sequential per calendar year.
create or replace function next_lead_id() returns text as $$
declare
  yr int := extract(year from now())::int;
  seq int;
begin
  insert into lead_counters (year, last_seq) values (yr, 1)
    on conflict (year) do update set last_seq = lead_counters.last_seq + 1
    returning last_seq into seq;
  return 'DM-' || yr || '-' || lpad(seq::text, 3, '0');
end;
$$ language plpgsql;

-- RLS is on with no policies anywhere: only the service-role key (used
-- server-side only, never shipped to the client) can read or write. The
-- anon key — never used by this app — gets zero access by default.
alter table employees enable row level security;
alter table projects enable row level security;
alter table daily_updates enable row level security;
alter table leads enable row level security;
alter table lead_counters enable row level security;
