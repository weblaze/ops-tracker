-- Lightweight support for people working across multiple active projects:
-- one primary project still drives all the detailed fields, this just tags
-- which other projects were also touched today for visibility.
alter table daily_updates add column also_project_names text[] not null default '{}';
