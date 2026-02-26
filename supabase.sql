-- Tabelas para rodar no SQL editor do Supabase antes de subir

create table if not exists users (
  id text primary key,
  name text,
  email text unique,
  password_hash text not null,
  onboarding_completed boolean default false,
  created_at bigint
);

create table if not exists sync_data (
  id text primary key,
  user_id text references users(id) on delete cascade,
  table_name text,
  data text,
  version bigint,
  updated_at bigint
);

create index if not exists sync_data_user_version_idx on sync_data(user_id, version);
