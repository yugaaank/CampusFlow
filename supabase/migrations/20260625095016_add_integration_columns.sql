alter table if exists profiles
  add column if not exists google_calendar_refresh_token text,
  add column if not exists google_calendar_email text;
