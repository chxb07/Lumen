-- Grant execute permissions back to public roles so that PostgreSQL can evaluate RLS policies and trigger functions successfully.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO public, anon, authenticated;
