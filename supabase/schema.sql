create table if not exists public.keys (
    id uuid primary key default gen_random_uuid(),

    key_hash text not null unique,

    duration text not null
        check (duration in ('1d', '7d', '30d', 'unlimited')),

    status text not null default 'active'
        check (status in ('active', 'revoked')),

    created_at timestamptz not null default now(),

    expires_at timestamptz null,

    created_by text not null default 'admin'
);

create index if not exists keys_key_hash_idx
    on public.keys(key_hash);

create index if not exists keys_status_idx
    on public.keys(status);

create index if not exists keys_expires_at_idx
    on public.keys(expires_at);

alter table public.keys enable row level security;
