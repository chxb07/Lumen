
-- pin search_path on remaining trigger fn
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

-- revoke direct EXECUTE on security-definer helpers; RLS policies still work because they execute as definer
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_admin(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
